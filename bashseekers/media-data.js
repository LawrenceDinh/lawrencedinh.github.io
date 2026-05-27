// Static GitHub Pages cannot auto-scan gallery folders at runtime.
// To add media, place local files in gallery-uploads/ and thumbnails in
// gallery-thumbs/, then add an entry here using relative paths.
// YouTube items need videoId. Instagram items need a public url and should
// include a thumbnail. Local uploads need src and thumbnail paths.
// BigCartel gallery images were downloaded locally for this demo; future
// custom uploads should be added to gallery-uploads/ and registered here.
const GALLERY_ITEMS = [
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "RAW STREET",
    title: "Raw Street Fun Vol.13",
    videoId: "jbwpcrjW47g",
    thumbnail: "https://img.youtube.com/vi/jbwpcrjW47g/hqdefault.jpg",
    layout: "tall"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "TOUGE",
    title: "USA Touge Drifting",
    videoId: "RSi1aWSrP8g",
    thumbnail: "https://img.youtube.com/vi/RSi1aWSrP8g/hqdefault.jpg"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "LOCAL SHREDDERS",
    title: "RAW TOUGE DRIFTING [ E36 + Miata ]",
    videoId: "jPHUAxGhHSw",
    thumbnail: "https://img.youtube.com/vi/jPHUAxGhHSw/hqdefault.jpg",
    layout: "wide"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "VHS SESSION",
    title: "Raw Street Fun Vol.8",
    videoId: "y6HFm9VGD9E",
    thumbnail: "https://img.youtube.com/vi/y6HFm9VGD9E/hqdefault.jpg"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "NA8 STREET",
    title: "NA8 MIATA STREET DRIFT",
    videoId: "QuPWbnNe9q0",
    thumbnail: "https://img.youtube.com/vi/QuPWbnNe9q0/hqdefault.jpg"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "STREET FUN",
    title: "Raw Street Fun Vol. 12",
    videoId: "m4ioCUxh5LI",
    thumbnail: "https://img.youtube.com/vi/m4ioCUxh5LI/hqdefault.jpg"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "RAW STREET",
    title: "Raw Street Fun Vol.3",
    videoId: "TSW8tvN4xME",
    thumbnail: "https://img.youtube.com/vi/TSW8tvN4xME/hqdefault.jpg"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "TRACK DAY",
    title: "my first track day - all day drifting NA8c roadster",
    videoId: "map7IL9CNII",
    thumbnail: "https://img.youtube.com/vi/map7IL9CNII/hqdefault.jpg"
  },
  {
    featured: true,
    type: "youtube",
    sourceLabel: "YOUTUBE",
    category: "GARAGE TECH",
    title: "Na miata airbag removal and gauge install",
    videoId: "493Lh5L0sc0",
    thumbnail: "https://img.youtube.com/vi/493Lh5L0sc0/hqdefault.jpg"
  },
  {
    featured: false,
    type: "upload",
    mediaKind: "image",
    sourceLabel: "UPLOAD",
    category: "BIGCARTEL GALLERY",
    title: "Bashseekers Gallery 01",
    src: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-01.jpg",
    thumbnail: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-01.jpg"
  },
  {
    featured: false,
    type: "upload",
    mediaKind: "image",
    sourceLabel: "UPLOAD",
    category: "BIGCARTEL GALLERY",
    title: "Bashseekers Gallery 02",
    src: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-02.png",
    thumbnail: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-02.png"
  },
  {
    featured: false,
    type: "upload",
    mediaKind: "image",
    sourceLabel: "UPLOAD",
    category: "BIGCARTEL GALLERY",
    title: "Bashseekers Gallery 03",
    src: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-03.jpg",
    thumbnail: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-03.jpg"
  },
  {
    featured: false,
    type: "upload",
    mediaKind: "image",
    sourceLabel: "UPLOAD",
    category: "BIGCARTEL GALLERY",
    title: "Bashseekers Gallery 04",
    src: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-04.png",
    thumbnail: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-04.png"
  },
  {
    featured: false,
    type: "upload",
    mediaKind: "image",
    sourceLabel: "UPLOAD",
    category: "BIGCARTEL GALLERY",
    title: "Bashseekers Gallery 05",
    src: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-05.jpeg",
    thumbnail: "gallery-uploads/bigcartel-gallery/bigcartel-gallery-05.jpeg"
  }
];
