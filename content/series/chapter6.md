# Full-Stack Flight, Chapter 6: Transmitter, Part 1: Transceiver Platform
![banner](https://i.imgur.com/1vB7TGB.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](https://medium.com/@timhanewich/full-stack-flight-building-a-quadcopter-ecosystem-from-scratch-18d43386bb6d). This article contains Amazon affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.*

Over the previous three chapters in this series, we learned how the *Centauri Quadcopter* was designed, fabricated, assembled, wired, and programmed from the ground up. Now, with a functioning quadcopter, it's time to focus on the other half of the equation: how the pilot will control it!

In drone piloting, this is often called the pilot's **transmitter**: a device the pilot uses to *transmit* control commands to the drone in real time, continuously updating its flight. A transmitter is typically responsible for the following tasks:
1. Sending control data to the drone that represents the pilot's control input.
2. Receiving telemetry data from the drone and presenting it to the pilot on a screen or dashboard.

In many commercial systems, the transmitter may do more than this, and sometimes less. At a bare minimum it handles #1, with #2 being a common addition. My previous quadcopter, [Scout](https://timhanewich.medium.com/taking-flight-with-the-raspberry-pi-pico-micropython-diy-quadcopter-drone-61ed4f7ee746), only did #1 (a single-direction communication stream); but as we discussed in depth in [chapter 2](https://medium.com/@timhanewich/full-stack-flight-chapter-2-defining-a-communication-protocol-41bfc589a319), communication in the *Centauri* system is bidirectional, so the transmitter must *also* be able to receive data from the drone!

When designing the pilot side of the *Centauri* ecosystem, I had two options for how to build the transmitter:
- **Dedicated Device**: build a custom, dedicated system with all the bells and whistles needed to control the quadcopter *and* show telemetry: joysticks, trigger switches, buttons, screens, an onboard battery, etc.
- **Extend Laptop Capability**: equip a standard laptop with the ability to send and receive radio communications, use a standard USB-ready gamepad, and write a script that runs on the PC to perform all operations.

Both options have their pros and cons. To cut a long story short, I ultimately chose the **Extend Laptop Capability** option. It's certainly the path that gets us up and flying as quickly as possible, taking advantage of an off-the-shelf gamepad (the Xbox Controller) and the laptop's display for showing data. All we have to worry about from there is giving the laptop the *ability* to send and receive data with the quadcopter, plus the script that orchestrates the entire operation. For simplicity and speed, this certainly beats designing and building a custom transmitter!

We can think of the transmitter as three separate components brought together as one:

![pic of 3-part transmitter system](https://i.imgur.com/ysyQIHS.png)

Since the gamepad side is very simple (buy [an Xbox controller](https://amzn.to/4wUxGlE) and plug it into the PC via USB!), I'll focus on how I developed the other two components: **the transceiver platform** and the **transmitter program**. In this article, I'll focus on *the transceiver platform*.

## Quick Reference: Complete Hardware List
Before diving in, here's a one-stop shopping list of every component used to build the transceiver platform, for easy reference! Just in case you visited this chapter specifically to find a link to something you needed to buy. 😊

- [Raspberry Pi Pico](https://amzn.to/4vZ5DkH) (microcontroller) - 1x
- [HC-12](https://amzn.to/4eWx48V) (wireless transceiver) - 1x (the quadcopter also has one)
- [FLEXI-SMA-433 433 MHz antenna](https://www.digikey.com/short/qjz8575r) - 1x (*optional - you can also use the HC-12's spring antenna if low-range is acceptable*)
- [CP2102](https://amzn.to/4wDVgTh) (USB-to-UART adapter) - 1x
- 3D-printed platform ([.stl files on Thingiverse](https://www.thingiverse.com/thing:7376838))
- A bit of wire and solder!

## Transceiver Platform: Hardware
On its own, a laptop can't communicate over the 433 MHz band the way the HC-12 on the *Centauri* quadcopter can. So we have to give the laptop that ability. Fortunately, the solution is rather simple: create a small, lightweight device that the PC communicates with via serial, and let that device handle the sending and receiving over the HC-12. You can think of this **transceiver platform** as a "broker" between the PC and the quadcopter, handling the transmission and reception of messages over the air.

The transceiver platform is a very simple device that plugs into the laptop via USB:

![transceiver plugged in](https://i.imgur.com/F31LuQk.png)

As pointed out in the photo above, it connects to the laptop via a [CP2102](https://amzn.to/4wDVgTh) USB-to-UART adapter that lets the laptop communicate with it seamlessly. On the radio side, a [FLEXI-SMA-433 433 MHz antenna](https://www.digikey.com/short/qjz8575r) lets it broadcast and receive data over the 433 MHz band. I've had a lot of success with this antenna and recommend it!

At the logic layer, the transceiver platform is very simple: a Raspberry Pi Pico wired to an HC-12:

![close up pic of the transceiver platform](https://i.imgur.com/BPXfCkq.png)

And as you can probably tell from the images above, I designed and 3D-printed a very simple platform for mounting all the components:

![pic of platform design files](https://i.imgur.com/mHdCT64.png)

You can download the `.stl` files [on Thingiverse](https://www.thingiverse.com/thing:7376838)! As noted above, it's a simple two-component design. (See the *Quick Reference* list above for the full parts list.)

## Transceiver Platform: Software
With the transceiver's hardware covered and assembled, we'll move on to the *code* flashed onto the transceiver's Raspberry Pi Pico. Like the *Centauri* quadcopter's flight controller, it's written in MicroPython.

The role of the transceiver platform is simple: serve as a "broker" between the PC and the quadcopter. In other words, if a message is received from the drone, send it to the PC via the USB connection; and if the PC sends a message to the transceiver platform via USB, send it on to the drone. That simple!

And so our code is quite simple too! You can find the complete source code (two files) for the transceiver platform [here](https://github.com/TimHanewich/centauri/tree/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/transceiver/src), which I'll explain below:
- [main.py](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/transceiver/src/main.py): the main transceiver platform operation code, handling the receiving and transmitting of messages via the onboard HC-12.
- [HC12.py](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/transceiver/src/HC12.py): a lightweight "helper" module I wrote that makes interfacing with the HC-12 in MicroPython easier. More information about it can be found [here](https://github.com/TimHanewich/MicroPython-Collection/tree/master/HC-12).

![complete transmitter](https://i.imgur.com/NqpJCmr.png)

As shown in the diagram above, there are **four types** of communication exchanged between the PC program and the transceiver platform (connected via USB, using UART to communicate):
1. **PING/PONG**: the PC can send `TRANPING` (encoded in ASCII) to the transceiver as a "hey, are you there?" check. If received, the transceiver responds `TRANPONG` to confirm it's on.
2. **STATUS**: the PC can also request a status update. If the PC sends the message `TRANSTATUS?` (encoded in ASCII), the transceiver responds with the HC-12's configuration (mode, channel, power). *Note: as of this writing, this functionality is available but not used.*
3. **TRAN Message**: the transceiver platform can send any unstructured message to the PC to flag a situation, status, or issue. To ensure a message that originated from *the transceiver* isn't confused with one that originated from *the drone*, `TRAN` (encoded in ASCII) is prepended to the message.
4. **"Passthrough" Communication**: for all other binary payloads the transceiver platform receives from or sends to the PC, if it *isn't* one of the payload types above, it can be assumed to be a message either from the drone (bound for the transmitter) or from the transmitter (bound for the drone).

The fourth communication type, the "passthrough," is the most important and most commonly used capability of the transceiver platform. To reiterate, the main purpose of the transceiver platform is to serve as a "passthrough broker" between the drone and the transmitter program, handling the wireless transmitting and receiving.

With those communication types covered, let's take a high-level look at how the transceiver platform, powered by code running on the Raspberry Pi Pico, operates:

![operational architecture](https://i.imgur.com/GWdYiV4.png)

As you can see above, when the transceiver platform's Raspberry Pi Pico first boots up, it runs through a four-step boot sequence. In this stage, it:
- Turns on the onboard LED to confirm it has received power and is booting.
- Sets up two UART interfaces to communicate with both the PC and the HC-12 (both use UART to communicate with the Pico).
- Configures the HC-12 according to the *Centauri-specific* settings.
- Sends an "I'm online now!" message to the PC, in case it's listening and waiting for it.

The entire boot sequence is quite quick! It usually completes in under a second, ready to go almost as soon as power is received.

After booting, it moves into the operational phase, the most important piece! In this phase it:
- Checks for new PC-to-drone communication. It checks the UART interface with the PC for incoming data. As long as this data isn't one of the three "internal" message types described above, it assumes the PC intends to send it out to the drone.
- If there is new PC-to-drone data, transmits it out via the HC-12, relaying it unaltered over UART.
- Checks for new drone-to-pilot communication. It checks the UART interface with the HC-12 for newly received data. If there is new data, it assumes it's a message from the drone intended for the pilot.
- If there is new drone-to-pilot communication, relays it unaltered to the PC via UART.

And that's it! It really is that simple. The transceiver platform is nothing more than a broker, relaying messages between the drone and the pilot with low latency using its HC-12.

## Close
With the transceiver platform assembled and operational, the PC running our transmitter program now has an "accessory device" that lets it wirelessly communicate with the drone over the 433 MHz band!

In the next chapter, we'll take a closer look at exactly how the PC transmitter program works to control the *Centauri* drone!

Click here to continue reading in this series: [Full-Stack Flight, Chapter 7: Transmitter, Part 2: The Pilot's Control Interface](https://medium.com/@timhanewich/full-stack-flight-chapter-7-transmitter-part-2-the-pilots-control-interface-dd14b90d5169).

*Read to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*