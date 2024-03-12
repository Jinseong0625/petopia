const eSocketPacket = {
    none : 0,
    create_channel : 1,
    join_channel : 2,
    join_world : 3,
    exit_world : 4,
    move_left : 5,
    move_right : 6,
    call : 7,
    throwball : 8,
    throwdisk : 9,
    throw_select : 10,
    throw_end : 11,
    give_snack : 12,
    give_mungpuccino : 13,
    message : 999,

}

module.exports = { eSocketPacket };