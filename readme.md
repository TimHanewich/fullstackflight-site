## Host Locally (testing)
Navigate to `docs` and run this:

```
python -m http.server 8000
```

And it will then be availale at `http://localhost:8000`

## Posting Writings

### Write Content
Write your content as a `.md` document in [posts/content](./posts/content/).

At the very top of the document, add metadata about the post, like this for example:

```
---
id: chapter1
title: 'Full-Stack Flight, Chapter 1: The Centauri Ecosystem'
description: 'Explore the three parts of the Centauri ecosystem: the quadcopter, the pilot transmitter, and the telemetry analysis tools. See how they work together to turn pilot input into flight and flight data into insight.'
---
```

### Build
Run [posts/build.py](./posts/build.py) which will read the `.md` file you wrote in the `content/` folder and build it into a page on the website.
- You will have to have the python packages listed in [requirements.txt](./posts/requirements.txt) installed.
- It will copy and populate [template.html](./posts/template.html).
- The resulting `.html` page will be saved as `index.html` under a new folder named after the `id` parameter of your `.md` file metadata, in [docs/posts](./docs/posts/). e.g. `docs/posts/chapter0/index.html`