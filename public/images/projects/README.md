# Project galleries

Each project has its own folder. Add a new project like this:

```text
public/images/projects/
  p5/
    cover.png   # card / featured image
    01.png      # gallery slide 1 (image)
    02.mp4      # gallery slide 2 (video)
    03.png      # gallery slide 3
    video-poster.png  # optional poster for a video thumb
```

Then register paths in `lib/data.ts`:

```ts
{
  id: 'p5',
  // …
  coverImage: '/images/projects/p5/cover.png',
  gallery: [
    '/images/projects/p5/01.png',
    // Video: .mp4 / .webm / .ogg / .mov are detected automatically
    '/images/projects/p5/02.mp4',
    // Or explicit object with a poster thumbnail:
    {
      type: 'video',
      src: '/images/projects/p5/02.mp4',
      poster: '/images/projects/p5/video-poster.png',
    },
    '/images/projects/p5/03.png',
  ],
}
```

Supported video formats: `.mp4`, `.webm`, `.ogg`, `.mov`.

Keep all media for a project only inside that project’s folder.
