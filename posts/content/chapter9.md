---
id: chapter9
title: 'Full-Stack Flight, Chapter 9: Closing Thoughts'
description: 'Reflect on the challenges and rewards of building a quadcopter from scratch. Find practical advice for your own build, explore ideas for future improvements, and connect with fellow makers.'
---

# Full-Stack Flight, Chapter 9: Closing Thoughts
![banner](https://i.imgur.com/mJ1f6Ak.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](../chapter0).*

At this stage in the series we've explored Centauri's quadcopter, transmitter, radio communication, and telemetry analysis, along with Link's role in checking reception before flight. In this final chapter I'll share some closing thoughts on the project overall, along with a few tips that will hopefully help you if you pursue building your own!

## Why do all this?
The first question I want to address is the "why do all this?" question. As you can probably tell from the series, building a fully custom quadcopter and pilot transmitter is a daunting undertaking. Financially, it may even be *cheaper* to buy an off-the-shelf quadcopter/transmitter pair and call it a day! And from a time-to-value perspective, you'd be looking at potentially months of research and development before ever getting in the air, versus maybe a 2-day shipping window if you buy off the shelf.

The answer is: **the challenge**. I, like you if you're still reading this, am an engineer. And engineers don't just like *using* things; they like *making* them, and *understanding* how they work. The off-the-shelf method gives you the quickest time to use, but you skip over the fun (and difficult) parts of building your own. And that difficult, uphill battle of figuring everything out is where the *real learning* happens.

The pride I felt when [*Scout* achieved its first flight back in 2023](https://www.youtube.com/watch?v=Wh5G9zdJbzk) and then when [Centauri achieved its first flight in 2025](https://x.com/TimHanewich/status/1982566777273163850/video/1), after *months* of frustration, hard work, and exploring new ideas, will *never* be something you can purchase. And the learnings that come along the way are a great bonus!

But more than that, I think building your own quadcopter (or any robotics project for that matter) is more valuable today than it has ever been. We live in an AI era, where anybody with access to the latest AI coding agent can "fake" intelligence or capability extremely easily.

Building something complicated, in both the software *and* hardware world, is not something that can be replicated by a 3-minute prompt. If you want to stand out and show your intrinsic skill, talent, or knowledge, venturing into the hardware space and completing a multi-month build is a wonderful way to set yourself apart.

## To go faster, slow down
Something was very different between my first attempt at a custom flight controller (Scout) and my second (Centauri): my approach to the building process.

In 2023 when I built *Scout*, my engineering approach was to move quickly, break things, and iterate fast until I stumbled into a problem (that's a bit exaggerated, but you get the point). I wasn't focused on any one part of the project for very long; I'd get one piece mostly working and then quickly move on to the next, so focused on getting "the big payoff" as soon as possible: seeing Scout fly!

That mindset caused more problems than it fixed. Building something that bridges the software and hardware world, and is as complex as a quadcopter, is *very* challenging. It warrants time spent early in the project planning, weighing various approaches, and then relentless attention to detail through every facet of the build. While *Scout* flew, I wouldn't call it as reliable or efficient as it could have been.

Fortunately, I learned from my mistakes. About two years later when making *Centauri*, I was far more methodical through the entire planning, design, building, programming, and testing process. No doubt I had a burning desire to see *Centauri* fly after the countless hours I invested turned into days, weeks, and months. But from what I learned with *Scout*, I knew any rushing would only cost me in the long run, because then I'd have to carve out time to *go back* and fix errors that wouldn't have been there had I just given that part of the project the time it deserved.

With *Centauri* I was much more methodical and detail-oriented through every part of the project. In hindsight, my approach was likely subconsciously inspired by "Gradatim Ferociter", the motto of Blue Origin that I must have read about a decade prior. [Jeff Bezos explained the motto](https://www.geekwire.com/2016/jeff-bezos-blue-origin-motto-logo-boots/):

> *“Gradatim Ferociter” is Latin for “Step by Step, Ferociously. If you’re building a flying vehicle, you can’t cut any corners. If you do, it’s going to be just an illusion that it’s going to make it faster. You have to do it step by step, but you do want to do it ferociously.”*

## This isn't easy!
Let me be the first to tell you: building a custom quadcopter is *not* an easy feat. Even having this series and sample code to guide you, it will be challenging. If you decide to build your own iteration of *Centauri*, please bear this in mind. Be be kind to yourself. Take your time. This is a very daunting project, and one you likely won't succeed at on the first try. Focus on the small things, one after another, and eventually the bigger picture will come together.

PID tuning, shown below, is one of the most frustrating part of the building process:

![not easy](https://i.imgur.com/4K6UwEW.gif)

And even after you have everything working, things happen!

![crash](https://i.imgur.com/y0qJR6k.gif)

## Future Improvements
As I described in [chapter 1](../chapter1), *Centauri* was already a huge upgrade over *Scout*, for a number of reasons. Centauri focuses on approachable rate control rather than the extensive flight features found in mature commercial systems.

I do plan to make further improvements to *Centauri*, building on this fantastic foundation. The following come to mind as immediate ideas:
- **Tweak Angle Estimates**: The *Centauri Flight Controller* uses a complementary filter to estimate the pitch and roll angles during flight. While the angles are mostly correct, there are certainly discrepancies. I'll need to take a closer look, identify any potential errors, and then work on improving their accuracy.
- **Advanced Flight Controller Modes**: as I discussed in [chapter 5](../chapter5), the *Centauri Flight Controller*, while impressive, is actually quite primitive in its capabilities. At some point I'd like to equip *Centauri* with additional hardware (sensors) and software to let it hold attitude, hold position, or even fly to various waypoints. This will be quite the undertaking!
- **Handheld Transmitter**: in [chapter 6](../chapter6) I described the decision to use an "augmented" PC (laptop) as the transmitter instead of building a custom transmitter. That decision worked very well! But at some point I'd like to fly *Centauri* without packing up a full laptop and transceiver platform. For that, I'll need to design, build, and implement a handheld pilot transmitter. Link is already handheld, but it only monitors radio traffic and cannot control the aircraft.


Those are just the immediate big ideas that come to mind, but I'm sure many more will follow! If you have any ideas or suggestions, I'm all ears.

## Building with the Carrier Board
The Centauri Flight Controller Carrier Board simplifies assembly by handling electrical routing between the components. It gives your electronics an organized foundation while keeping the components accessible for learning and experimentation.

This is a **bare carrier PCB**, not a complete flight controller or drone kit. It handles electrical routing between the components, saving you from creating those connections with point-to-point wiring. You still solder in the Pico and small components, then connect the external modules and ESCs to labeled pads.

The [shop](../../shop/) lists the Flight Controller Carrier Board at $29.99 plus shipping and the Link Carrier Board at $19.99 plus shipping, with separate parts lists for each build. Link is a handheld radio monitor for checking reception; it does not replace the pilot's transmitter.

Start with the [Quadcopter Build Guide](../quadcopter-build-guide/) for step-by-step assembly. The engineering explanations in this series help you understand what you're building, while the carrier board saves connection work. Assembly, troubleshooting, and flight testing still take care and patience.

## Join The Community!
In the three years since I released [my write-up series on *Scout*](https://timhanewich.medium.com/taking-flight-with-the-raspberry-pi-pico-micropython-diy-quadcopter-drone-61ed4f7ee746), I've had so many positive interactions with members of the maker community; people that were just like me when I first sat down to build my own custom quadcopter flight controller. Messages, YouTube comments, tweets, and more.

**I'm creating a space for any makers interested in building *their own* iteration of *Centauri* to share progress and ideas, ask questions, and celebrate their successes**! You can join us on the **Full Stack Flight Discord Server**. It's completely free to join in on the conversation!

![join](https://i.imgur.com/e5zezO2.png)

Scan the QR code above or click [here](https://discord.gg/wwqfmCUzGg) for an invite to the Full Stack Flight Discord Server!

I'll be there too, sharing my own progress and helping answer questions from those pursuing building *Centauri* themselves! I hope to see you there.

## Parting Thought
Building *my own* quadcopter, from absolute scratch, and taking flight had been a dream of mine. To build a flying machine, that would be amazing! And I remember just *how hard* it was pursuing this with *Scout* back in 2023. I remember the countless hours searching online, trying new ideas, reading over bugs, and brainstorming problems and their solutions.

If you can relate to that, I hope you're able to find value in this series. I hope it helps you accomplish exactly what you'd like to do *without* the headache I experienced. In a way, this series and the entire *Centauri* project is a distilled version of everything I learned, packaged up for a new maker to leverage.

Use this guide! Learn and build understanding! And do something amazing. Good luck to you. 😊