---
name: "sort-images-into-subfolders"
description: "Sort a folder of images with cryptic/stock filenames into per-subject subfolders (e.g. \"gato\", \"perro\") by visually inspecting each file and moving matches — on the user's own computer via the device bridge."
---

# Sort images into subfolders by visual content

Use this when the user has a folder of images (often downloaded stock photos with
cryptic filenames like `06c15e7271fe...884b3784.jpg` or `BILYFFEEYQU...IOEPR2HQ.jpg`)
and wants them organized into subfolders by what they actually show (e.g. all the
dogs into a `perros` subfolder, all the cats into `gatos`), instead of opening each
file in Finder/Preview and dragging it by hand.

Do the sorting yourself with tools — never ask the user to manually drag files, and
never drive Finder with simulated clicks (computer-use). This is strictly faster and
more reliable via the device bridge shell.

## Steps

1. **Confirm scope.** If not already clear, ask (one question) which folder to sort
   and which subject(s) to sort by. If the user just demonstrated it, infer the
   folder and subject from what they did and proceed.

2. **Subfolder naming.** Name each subfolder after the subject in Spanish, plural,
   lowercase (`perros`, `gatos`), unless the user gives another name. Create it inside
   the folder being sorted.

3. **Make sure the folder is reachable.** Check `get_device_info` / the session's
   connected folders. If the target folder isn't connected yet, call
   `device_request_folder_access` with that folder's path and a short reason.

4. **List the folder.** Use `device_list_dir` (non-recursive, unless subfolders also
   need scanning) to get the current file list and skip anything already inside an
   existing subject subfolder.

5. **Skip files whose subject is obvious from the filename** (e.g. `beagle_...`,
   `cat-2068462_640.jpg`) — classify those without opening them. For everything
   else, stage the ambiguous/cryptic-named files into the container with
   `device_stage_files` (batch multiple files in one call, up to the tool's limits).
   If `.avif`/`.webp` files don't render with `Read`, convert a copy to JPG/PNG in the
   container (e.g. Pillow) before viewing.

6. **Inspect each staged image** with `Read` (it renders visually) to determine its
   subject. Images with a single subject are moved without asking.

7. **Mixed-subject images** (e.g. two dogs and a cat in the same photo): don't decide
   on your own. Ask the user, per image, whether to move it to the subfolder or leave
   it in place (one short question naming the file and what it shows).

8. **Create the destination subfolder(s) on the device**, if not already present:
   `device_bash` with `mkdir -p "<folder>/perros"`.

9. **Move the matching files** with `device_bash` using `mv -n` (quote every path;
   move in one command per subfolder when possible, e.g.
   `mv -n "<folder>/file1.jpg" "<folder>/file2.webp" "<folder>/perros/"`). Never
   reconstruct file contents by hand — this is a plain filesystem move, not an edit.

10. **Verify** with `device_list_dir` on the destination subfolder that the expected
    files landed there, and that they're gone from the parent listing.

11. **Report back concisely**: how many files were moved into each subfolder, and
    list them by original filename (since the names are usually meaningless to the
    user, mention what each one showed, e.g. "06c15e7271fe...jpg — gato en fondo
    blanco"). Mention any mixed-subject images left pending.

## Notes

- All of this runs on the user's own machine through the device bridge
  (`mcp__remote-devices__device_*` tools), not in the cloud container — files never
  need to leave their computer except transiently, staged into the container only so
  `Read` can render them for visual inspection.
- If `device_bash` can't delete/move due to permissions, `mv` normally works even
  when deletion doesn't (moving isn't deleting); only fall back to asking the user
  if a plain `mv` errors out.
- Don't re-stage files already classified from filename alone — only ambiguous ones
  need the stage+Read round trip, to keep this fast.