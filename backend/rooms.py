rooms = {}


def create_room_if_not_exists(room_id):
    if room_id not in rooms:
        rooms[room_id] = {
            "players": [],   # list of socket IDs in join order
            "names": {},     # sid -> name
            "secrets": {},   # sid -> secret number
            "turn_index": 0, # whose turn it is
        }
    return rooms[room_id]


def add_player(room_id, sid, name):
    room = create_room_if_not_exists(room_id)
    if sid not in room["players"]:
        room["players"].append(sid)
    room["names"][sid] = name  # update name on reconnect too
    return room


def remove_player(sid):
    for room_id, room in list(rooms.items()):
        if sid in room["players"]:
            room["players"].remove(sid)
            room["names"].pop(sid, None)
            room["secrets"].pop(sid, None)
            # Fix turn_index if it's now out of bounds
            if room["players"] and room["turn_index"] >= len(room["players"]):
                room["turn_index"] = 0
            return room_id, room
    return None, None