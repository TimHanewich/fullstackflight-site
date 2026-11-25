---
id: chapter1
title: 'Full-Stack Flight, Chapter 1: The Centauri Ecosystem'
description: 'Explore the Centauri quadcopter, pilot transmitter, Link radio monitor, and telemetry analysis tools, and see how they support building, testing, and flying.'
---

# Full-Stack Flight, Chapter 1: The Centauri Ecosystem
![banner](https://i.imgur.com/JLIMLAe.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](../chapter0). This article contains Amazon affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.*

As was mentioned in [the introductory article](../chapter0), *Centauri* is a full quadcopter ecosystem developed from the ground up, with each component designed to support flight of the *Centauri Quadcopter*:

- **The Centauri Quadcopter**: I designed the complete quadcopter package from scratch, including the onboard flight controller ("brain"), the 3D-printed airframe, wiring schematics, and more.
- **The Centauri Transmitter**: this is what the pilot uses to control the quadcopter during flight. To keep things simple and accessible, it's a lightweight program that runs on the user's computer and can be controlled with a plugged-in gamepad like an Xbox controller.
- **Analysis Software**: a lightweight Python script that unpacks logged telemetry (a binary file) into a human-readable CSV file that can then be plotted and graphed.
- **Centauri Link**: a handheld device that passively listens for radio traffic to help check reception before flight.

The aircraft uses a carrier PCB to simplify electrical connections. See the [Quadcopter Build Guide](../quadcopter-build-guide/) for step-by-step assembly instructions.

In this article, I'll describe each of these components, their roles, and how they work together.

## The Centauri Quadcopter
![quadcopter](https://i.imgur.com/GsYE2rI.jpeg)

The star of the show! The Centauri Quadcopter is where most of the effort of this project went and where a lot of the frustration was concentrated. It is, by far, the most complex component of the system.

The *Centauri* Quadcopter is fully designed and developed from the ground up. While off-the-shelf components were used for the motors, electric speed controllers, battery, IMU, etc., I designed the body itself, 3D-printed it, assembled and wired it all, and fully programmed the flight controller that runs on the onboard Raspberry Pi Pico. Every decision about how the quadcopter behaves in the air traces back to code I wrote.

![first flight](https://i.imgur.com/TuQ06gF.gif)

*Above: first flight of the Centuari quadcopter*

The quadcopter is the most engineering-intensive component of this entire ecosystem. You can think of it as a highly reactive, self-correcting robot that is always obsessing over one thing: achieving the control input from the pilot (their desired pitch, roll, and yaw). It does this by constantly comparing what the pilot *wants* against what is *actually happening* and adjusting motor output to close the gap. In a nutshell, the quadcopter:
1. Listens for and unpacks control commands from the transmitter
2. Senses reality via an onboard IMU, determining its *actual* change in pitch, roll, yaw.
3. Compares the *desired* against *actual* in a "[PID loop](https://en.wikipedia.org/wiki/PID_controller)" to determine how to vary motor thrust for each of the four motors.
4. Adjusts motor output via a [PWM](https://en.wikipedia.org/wiki/Pulse-width_modulation) update to the four ESCs.
5. Repeats this loop several hundred times per second!

That is how a quadcopter stays in the air, via a very fast feedback loop.

## The Centauri Transmitter
![transmitter](https://i.imgur.com/MEK0Utk.jpeg)

In the quadcopter ecosystem, the *Transmitter* (commonly called "Radio Transmitter", "Radio Controller", or simply "Tx") is the device that the pilot uses to steer and control the drone during flight. The transmitter typically has a number of physical joysticks, switches, and buttons that capture the pilot's intent and digitally relay it to the quadcopter in real time. It is the bridge between human decision-making and machine behavior.

In a quadcopter transmitter, there are **four** primary control dimensions that must be rapidly tracked and sent to the drone:
- **Throttle**: controls the speed of the motors, allowing the drone to climb or descend.
- **Pitch**: controls the forward/backward tilt of the drone.
- **Roll**: controls the left/right tilt of the drone.
- **Yaw**: rotates the quadcopter clockwise or counter-clockwise (adjusts the direction it is pointing).

Thus, the transmitter is really doing *three* things simultaneously, many times per second:
- Reading pilot input via the physical controls (joysticks, switches, triggers, etc.)
- Interpreting these values and "packing" them into a high-density binary signature that can efficiently be sent over the air to the quadcopter.
- Delivering this binary data to the quadcopter by transmitting it via radio communications.

This all happens in a tight loop. The faster and more reliably the transmitter can do this, the more responsive the quadcopter feels to the pilot.

As you can see in the image above, I went for a *very* simple and accessible design. Rather than building custom hardware with physical joysticks and a dedicated handheld unit, the transmitter in this project is a 3-part system:
- An Xbox controller plugged into a computer
- A radio transceiver module ([RPi Pico](https://amzn.to/4vZ5DkH) and [HC-12](https://amzn.to/4eWx48V))
- A Python program that runs on the computer, interprets Xbox controller input, and broadcasts control commands via the HC-12.

## Analysis Software
![analysis](https://i.imgur.com/qYf9UDG.png)

The **analysis software** lets us inspect recorded flight data. As explained in chapter 5, telemetry is collected into a RAM buffer during flight and flushed to onboard flash storage while throttle is zero. Buffer and flash capacity limit how much can be retained. Because the storage on the Raspberry Pi Pico is tiny (only 2 MB) *and* the flight controller must be as efficient as possible, wasting no precious CPU cycles on formatting, the telemetry is logged in raw binary format.

The analysis software that comes with Centauri is a lightweight Python script that decodes a binary telemetry file retrieved from the quadcopter's Raspberry Pi Pico into a human-readable CSV file containing the data it captured:
- Battery Voltage
- Pitch Rate (actual)
- Roll Rate (actual)
- Yaw Rate (actual)
- G-Force
- Input Throttle
- Input Pitch
- Input Roll
- Input Yaw
- Motor 1 throttle as a % (front left)
- Motor 2 throttle as a % (front right)
- Motor 3 throttle as a % (rear left)
- Motor 4 throttle as a % (rear right)

Once converted, that data can be analyzed after a flight to diagnose problems, validate tuning changes, or better understand the behavior of the quadcopter's PID loops in a given environment or situation:

![example_analysis](https://i.imgur.com/M8lCkOG.png)

## Centauri Link

Link is a small handheld radio monitor built around a Pico, HC-12, and OLED display. It passively listens for Centauri traffic, helping you check reception while walking away from the transmitter without risking the aircraft in flight. Reception on foot does not guarantee the same range in flight.

The [Link section of the shop](../../shop/#link) lists its bare carrier board, electronics, and mounting hardware. Like the aircraft's carrier board, it simplifies electrical routing but still requires soldering, assembly, and separately sourced components.

## Conclusion
The Transmitter, Quadcopter, and Analysis Software cover control, flight, and review. Link adds a portable way to observe the radio traffic before flying. The transmitter captures pilot intent and delivers it wirelessly. The quadcopter receives those commands, senses reality, and continuously corrects itself to match. And the analysis software lets you look back at what actually happened during flight so you can tune, debug, and improve.

In the chapters ahead, we'll take an in depth look at the components of the *Centauri* ecosystem, starting first with the quadcopter! Click here to continue reading in this series: [Full-Stack Flight, Chapter 2: Defining a Communication Protocol](../chapter2).

*Ready to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*