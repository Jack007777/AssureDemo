import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


def main() -> None:
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) != 4:
        raise SystemExit(
            "Usage: blender --background --python trim_middle_crossbar_left.py "
            "-- INPUT OUTPUT OBJECT_NAME TRIM_METERS"
        )

    input_path = Path(args[0]).resolve()
    output_path = Path(args[1]).resolve()
    object_name = args[2]
    trim_meters = float(args[3])

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(input_path))

    obj = bpy.data.objects.get(object_name)
    if obj is None or obj.type != "MESH":
        raise RuntimeError(f"Mesh object not found: {object_name}")

    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)

    inverse_world = obj.matrix_world.inverted()
    world_x_values = [(obj.matrix_world @ vertex.co).x for vertex in bm.verts]
    current_min_x = min(world_x_values)
    cut_x = current_min_x + trim_meters
    plane_co = inverse_world @ Vector((cut_x, 0.0, 0.0))
    plane_no = (inverse_world.to_3x3() @ Vector((1.0, 0.0, 0.0))).normalized()

    result = bmesh.ops.bisect_plane(
        bm,
        geom=list(bm.verts) + list(bm.edges) + list(bm.faces),
        dist=1e-6,
        plane_co=plane_co,
        plane_no=plane_no,
        clear_inner=True,
        clear_outer=False,
    )

    cut_edges = [
        element
        for element in result["geom_cut"]
        if isinstance(element, bmesh.types.BMEdge) and element.is_valid
    ]
    if cut_edges:
        bmesh.ops.holes_fill(bm, edges=cut_edges, sides=0)

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
    )
    print(
        f"Trimmed {object_name}: minX={current_min_x:.9f}, "
        f"cutX={cut_x:.9f}, trim={trim_meters:.9f}"
    )


if __name__ == "__main__":
    main()
