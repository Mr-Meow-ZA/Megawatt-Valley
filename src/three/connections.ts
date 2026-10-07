import {connectionMask} from '../content/valleyLayout';
import type {EquipmentKind,PlacedEquipment,Vec2} from '../simulation/types';

/** Fences share tile-edge endpoints; a bend is two half-segments meeting at a post.
 * Gates orient to a straight neighbouring run. Isolated pieces preview along X.
 */
export function fenceConnections(kind:EquipmentKind,tile:Vec2,equipment:PlacedEquipment[]):number{
 if(kind!=='fence'&&kind!=='gate')return 0;
 const neighbours=new Set(equipment.filter(e=>e.kind==='fence'||e.kind==='gate').map(e=>e.tile.x+','+e.tile.y));
 return connectionMask(tile.x,tile.y,(x,y)=>neighbours.has(x+','+y))||5;
}
