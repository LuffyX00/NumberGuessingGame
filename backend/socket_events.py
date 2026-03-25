import socketio
from rooms import create_room_if_not_exists, add_player, remove_player, rooms

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

MAX_PLAYERS = 2


@sio.event
async def connect(sid, environ):
    print(f"[+] Connected: {sid}")


@sio.event
async def disconnect(sid):
    room_id, room = remove_player(sid)
    if room_id and room:
        # Notify remaining players
        await sio.emit("players", room["names"], room=room_id)
        # If game was running and someone left, reset so remaining player isn't stuck
        if len(room["players"]) < MAX_PLAYERS:
            room["secrets"] = {}
            room["turn_index"] = 0
            await sio.emit("player_left", room=room_id)
    print(f"[-] Disconnected: {sid}")


@sio.event
async def join_room(sid, data):
    room_id = data.get("room", "").strip().upper()
    name    = data.get("name", "").strip()

    if not room_id or not name:
        await sio.emit("error_msg", "Room ID and name are required.", to=sid)
        return

    room = create_room_if_not_exists(room_id)

    # Block if room already has MAX_PLAYERS and this sid is not already in it
    if sid not in room["players"] and len(room["players"]) >= MAX_PLAYERS:
        await sio.emit("error_msg", "Room is full! Only 2 players allowed.", to=sid)
        return

    add_player(room_id, sid, name)
    await sio.enter_room(sid, room_id)
    await sio.emit("players", room["names"], room=room_id)
    print(f"[~] {name} joined room {room_id} ({len(room['players'])}/{MAX_PLAYERS})")


@sio.event
async def set_secret(sid, data):
    room_id = data.get("room", "").strip().upper()
    number  = data.get("number")

    room = rooms.get(room_id)
    if not room:
        await sio.emit("error_msg", "Room not found.", to=sid)
        return

    if sid not in room["players"]:
        await sio.emit("error_msg", "You are not in this room.", to=sid)
        return

    if number is None:
        await sio.emit("error_msg", "Invalid secret number.", to=sid)
        return

    room["secrets"][sid] = int(number)

    total   = len(room["players"])
    ready   = len(room["secrets"])

    print(f"[~] Room {room_id}: {ready}/{total} secrets set")

    # Start game only when exactly MAX_PLAYERS have joined AND all set secrets
    if total == MAX_PLAYERS and ready == MAX_PLAYERS:
        room["turn_index"] = 0
        first_sid = room["players"][0]
        await sio.emit("game_start", room["names"][first_sid], room=room_id)
        print(f"[*] Game started in room {room_id}")
    else:
        # Tell this player how many are ready
        await sio.emit("waiting_status", {"ready": ready, "total": total}, to=sid)


@sio.event
async def guess(sid, data):
    room_id    = data.get("room", "").strip().upper()
    target_sid = data.get("target")
    guess_val  = data.get("guess")

    room = rooms.get(room_id)
    if not room:
        await sio.emit("result", "Room not found!", to=sid)
        return

    players = room["players"]
    if not players:
        await sio.emit("result", "No players in room!", to=sid)
        return

    # Enforce turn
    current_sid = players[room["turn_index"]]
    if sid != current_sid:
        await sio.emit("result", "⛔ Not your turn!", to=sid)
        return

    # Validate target
    if target_sid not in room["secrets"]:
        await sio.emit("result", "⛔ Invalid target!", to=sid)
        return

    correct = room["secrets"][target_sid]

    if int(guess_val) == correct:
        winner_name = room["names"][sid]
        await sio.emit("winner", f"🎉 {winner_name} wins!", room=room_id)
        print(f"[*] {winner_name} won in room {room_id}")
        return

    hint = "⬇️ Too low!" if int(guess_val) < correct else "⬆️ Too high!"
    await sio.emit("result", hint, to=sid)

    # Advance turn
    room["turn_index"] = (room["turn_index"] + 1) % len(players)
    next_sid = players[room["turn_index"]]
    await sio.emit("turn", room["names"][next_sid], room=room_id)


@sio.event
async def restart(sid, data):
    room_id = data.get("room", "").strip().upper()
    room = rooms.get(room_id)
    if room:
        room["secrets"] = {}
        room["turn_index"] = 0
        await sio.emit("restart", room=room_id)
        print(f"[~] Room {room_id} restarted")