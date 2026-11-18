---
id: chapter0
title: Full-Stack Flight: Building a Quadcopter Ecosystem from Scratch
---

# Full-Stack Flight: Building a Quadcopter Ecosystem from Scratch
![banner](https://i.imgur.com/3kLfGs5.jpeg)

*This article contains Amazon affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.*

I've been absolutely fascinated with [the quadcopter](https://en.wikipedia.org/wiki/Quadcopter) for many years now, with much of that fascination beginning when my engineering interests started expanding from software into the hardware space through robotics. For years, I viewed architecting and developing my own quadcopter *flight controller*, the onboard "brain" that keeps the quadcopter in the air, as my "Mount Everest"; Something that, at the time, was well outside of what I was capable of as an engineer!

But after *much* effort, I accomplished this goal in 2023 with my [Scout Flight Controller](https://timhanewich.medium.com/taking-flight-with-the-raspberry-pi-pico-micropython-diy-quadcopter-drone-61ed4f7ee746).

## Scout: A Post-Mortem
*Scout* was an amazing accomplishment. It took [so much effort](https://www.youtube.com/watch?v=mbrcnaByMyo) and it is still something I am very proud of. But being honest, it had some problems:
- No battery management (*I had no way of knowing battery voltage*)
- No custom bidirectional communication protocol (*I used an off-the-shelf transmitter*)
- No flight settings updates over-the-air (*I had to re-flash the firmware every time I made a PID change*)
- No telemetry logging & analysis (*I had no way of analyzing telemetry to debug problems*)

In addition to those lacking capabilities, it was also terribly computationally inefficient, using floating point math which is not efficient at all for high-frequency PID loops.

## Introducing Centauri
Two years after creating Scout in 2023, in 2025, I set out to build the second iteration of a custom flight controller. This time, I would own a much larger degree of the end-to-end system design, including the components I previously outsourced, and fix many of the small problems that made Scout *viable* but not *reliable*. That second iteration is *Centauri*: my second attempt at a custom quadcopter flight system, complete with a custom flight controller, quadcopter body, transmitter, and analysis software.

[**EMBED THIS VIDOE ON MEDIUM: https://www.youtube.com/watch?v=4ocy2szvcbM**]

Compared to Scout, Centauri would have:
- Vastly more efficient flight controller code, allowing for more stable PID rates and greater stability.
- An onboard radio communication module for bidirectional communication with the pilot.
- Ability to detect battery voltage and provide battery state of charge to the pilot via radio comms.
- Ability to quick-flash settings over the air before taking flight (not requiring flashing entire new firmware with "hard coded" settings).
- Telemetry logging onboard the flight controller's flash storage, allowing for later analysis.

With Scout, I used an "off the shelf" quadcopter transmitter/receiver pair, the [FlySky FS-i6](https://amzn.to/4fa6Yy9). This allowed me to outsource control communications to off-the-shelf hardware. Because with Centauri I'd be abandoning that approach and designing my own communication protocol from the ground up, I'd *also* be building the pilot's transmitter: a device on the pilot's end that allows the pilot to take control of the quadcopter, rapidly sending control updates.

Like Scout, my goal with Centauri was to keep the entire system accessible and understandable, not a black box like off-the-shelf flight controllers (think Betaflight), but something any aspiring developer or engineer could open up, read, and actually understand line by line. As a result, I made key design decisions: using a $4 Raspberry Pi Pico microcontroller as the "computer" onboard the quadcopter, writing the entire flight controller code in Python (MicroPython to be exact), and purchasing all components from Amazon, with the total investment being approximately $132. More on that later in this series!

Altogether, Centauri is a complete quadcopter ecosystem developed from the ground up:
- **The Centauri Quadcopter**: I designed the complete quadcopter package from scratch, including the onboard flight controller ("brain"), the 3D-printed airframe, wiring schematics, and more.
- **The Centauri Transmitter**: this is what the pilot uses to control the quadcopter during flight. To keep things simple and accessible, it's a lightweight program that runs on the user's computer and can be controlled with a plugged-in gamepad like an Xbox controller.
- **Analysis Software**: a lightweight Python script that unpacks logged telemetry (a binary file) into a human-readable CSV file that can then be plotted and graphed.

And true to the goal of keeping this whole system understandable and approachable, Centauri is **fully open source**. Every bit of it, the flight controller code, the airframe design files, the transmitter software, and the telemetry analysis tools, is available for free on [GitHub](https://github.com/TimHanewich/centauri). Anyone is welcome to explore it, learn from it, build their own, or contribute back!

![flying gif](https://i.imgur.com/3GprQfl.gif)

Being a fan of astronomy, I named this system *Centauri* after [Alpha Centauri](https://en.wikipedia.org/wiki/Alpha_Centauri), the closest star system to our solar system. Alpha Centauri contains three stars with two being more prominent, very similar to my Centauri project: three components, but two (the Quadcopter + Transmitter) being the far more prominent and important ones.

## Full Stack Flight: 9-Part Educational Series
Rather than just handing you working quadcopter specs, I'm walking through every design decision and every line of code behind Centauri so you can understand exactly how it works and build your own version of it. Like I did [with Scout](https://timhanewich.medium.com/taking-flight-with-the-raspberry-pi-pico-micropython-diy-quadcopter-drone-61ed4f7ee746), I've published a multi-article series on how I built Centauri from the ground up, covering both the overall architecture and the technical details. Those chapters are listed below:

- [Full-Stack Flight, Chapter 1: The Centauri Ecosystem](https://medium.com/@timhanewich/full-stack-flight-chapter-1-the-centauri-ecosystem-eacfcecc90f5)
- [Full-Stack Flight, Chapter 2: Defining a Communication Protocol](https://medium.com/@timhanewich/full-stack-flight-chapter-2-defining-a-communication-protocol-41bfc589a319)
- [Full-Stack Flight, Chapter 3: Quadcopter, Part 1: Designing a 3D-Printed Airframe](https://medium.com/@timhanewich/full-stack-flight-chapter-3-quadcopter-part-1-designing-a-3d-printed-airframe-9d4f9021a68c)
- [Full-Stack Flight, Chapter 4: Quadcopter, Part 2: Hardware and Electronics Package](https://medium.com/@timhanewich/full-stack-flight-chapter-4-quadcopter-part-2-hardware-and-electronics-package-69a5c26bc30b)
- [Full-Stack Flight, Chapter 5: Quadcopter, Part 3: The Flight Controller](https://medium.com/@timhanewich/full-stack-flight-chapter-5-quadcopter-part-3-the-flight-controller-310b3f288975)
- [Full-Stack Flight, Chapter 6: Transmitter, Part 1: Transceiver Platform](https://medium.com/@timhanewich/full-stack-flight-chapter-6-transmitter-part-1-transceiver-platform-7aee3793da9a)
- [Full-Stack Flight, Chapter 7: Transmitter, Part 2: The Pilot's Control Interface](https://medium.com/@timhanewich/full-stack-flight-chapter-7-transmitter-part-2-the-pilots-control-interface-dd14b90d5169)
- [Full-Stack Flight, Chapter 8: Unpacking Flight Telemetry for Analysis](https://medium.com/@timhanewich/full-stack-flight-chapter-8-unpacking-flight-telemetry-for-analysis-73d251a4a449)
- [Full-Stack Flight, Chapter 9: Closing Thoughts](https://medium.com/@timhanewich/full-stack-flight-chapter-9-closing-thoughts-1f6855269e5f)

*Note: This series assumes you have a general understanding of quadcopter flight dynamics. If you do not, please review [part 1 of my series on Scout](https://timhanewich.medium.com/how-i-developed-the-scout-flight-controller-part-1-quadcopter-flight-dynamics-400af73d21db) which covers flight fundamentals.*

*Read to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*