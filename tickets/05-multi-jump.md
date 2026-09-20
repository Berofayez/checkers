# #5: Multi-jump

Status: done

## Goal
A piece that can jump again immediately after jumping must keep jumping in
the same turn, before any other piece may move.

## Done when
- [x] After a jump, if the same piece has another legal jump, its turn does
      not end and only that piece's further jumps are highlighted.
- [x] The player cannot switch to a different piece mid-chain.
- [x] The chain continues until the jumping piece has no further legal jump,
      at which point the turn ends and play passes to the other player.
- [x] Piece counts update correctly across a multi-jump.

## Depends on
#4
