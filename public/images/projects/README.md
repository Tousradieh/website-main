# Project galleries

Each project has its own folder. Add a new project like this:

```text
public/images/projects/
  p5/
    cover.png   # card / featured image
    01.png      # gallery slide 1
    02.png      # gallery slide 2
    03.png      # …
```

Then register paths in `lib/data.ts`:

```ts
{
  id: 'p5',
  // …
  coverImage: '/images/projects/p5/cover.png',
  gallery: [
    '/images/projects/p5/01.png',
    '/images/projects/p5/02.png',
    '/images/projects/p5/03.png',
  ],
}
```

Keep all photos for a project only inside that project’s folder.
