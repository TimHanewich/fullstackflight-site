---
id: chapter4
title: 'Full-Stack Flight, Chapter 4: Quadcopter, Part 2: Hardware and Electronics Package'
description: 'Get to know the hardware onboard Centauri and how its carrier board simplifies electrical connections, from sensors and radio to power regulation and motors.'
---

# Full-Stack Flight, Chapter 4: Quadcopter, Part 2: Hardware and Electronics Package
![banner](https://i.imgur.com/dKRuwCe.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](../chapter0). This article contains Amazon affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.*

With the airframe covered in [the last chapter](../chapter3), let's look at the hardware that makes flight possible.

The **Centauri Flight Controller Carrier Board** handles electrical routing between the components. You don't need to build those connections with point-to-point wiring or work through each Pico pin assignment. Solder the Pico and small components onto the board, then connect the external modules and ESCs to its labeled pads.

The board is sold as a bare, unpopulated PCB. Electronics, motors, battery, and other parts are separate. The [shop and parts lists](../../shop/) explain what to buy, and the [Quadcopter Build Guide](../quadcopter-build-guide/) walks through assembly. 

Like any flight system, the full hardware and electronics package can appear sophisticated and complex, particularly to someone new to this area. In this chapter, however, I'll do my best to thoroughly describe the role of each and every component onboard the *Centauri* quadcopter.

The image below shows all hardware onboard *Centauri*, classified into four sections:

![pic of all onboard hardware, classified](https://i.imgur.com/v51C7Zr.png)

- **Avionics**: the central nervous system and "brain" of the operation.
- **Propulsion**: the active elements that directly make the drone fly.
- **Power**: the components responsible for taking raw battery power and conditioning it for safe distribution to the rest of the system.
- **Passive**: the elements that are present but play no active role in the direct operation of the quadcopter.

The two most important categories to understand are **Avionics** and **Propulsion**, as these are the "bread and butter" of quadcopters. The diagram below gives a high-level visualization of the basic process chain a quadcopter flight controller follows, and how the **avionics** and **propulsion** hardware work together to achieve stable flight:

![Flight Control Chain](https://i.imgur.com/6GhtfyW.png)

In the diagram above, each blue box is a different hardware component onboard the quadcopter. Each component plays a unique and vital role during flight. **If you are new to quadcopters and want to grasp how they work, focus on understanding how each of these components work together to achieve flight!** I'll provide a crash course below to get you started.

## Quick Reference: Complete Hardware List
Before diving in, here's a one-stop shopping list of every component used, for easy reference! Just in case you visited this chapter specifically to find a link to something you needed to buy. 😊

**Carrier board**
- [Centauri Flight Controller Carrier Board](../../shop/#flight-controller-carrier-board) - 1x bare PCB
- [Header pin strips](https://link.amazon/B09admQw7) - for soldering the Pico onto the board
- Wire, solder, and assembly hardware listed in the [shop](../../shop/#quadcopter-parts)

**Avionics**
- [Raspberry Pi Pico](https://amzn.to/4vZ5DkH) (microcontroller) - 1x
- [MPU-6050](https://amzn.to/4yh76Ev) (IMU) - 1x
- [HC-12](https://amzn.to/4eWx48V) (wireless transceiver) - 1x on the quadcopter (a 2nd is needed later for the transmitter)

**Propulsion**
- [5-inch tri-blade propellers, 16-pack](https://amzn.to/3QQwuAt) - 1x
- [Readytosky 2300 KV Brushless Motors (4-pack)](https://amzn.to/44lyILf) - 1x
- [ESC 4-pack](https://amzn.to/3SMnnBr) - 1x

**Power**
- [4S 3300 mAh LiPo Battery](https://amzn.to/3RwAqq7) - 1x
- [XT60 connector pack](https://amzn.to/4vwD25n) - 1x
- [MP1584EN 5V buck converter](https://link.amazon/B0g34yNj3) - 1x
- [10 uF capacitor](https://amzn.to/4bFcebU) and [0.1 uF capacitor](https://amzn.to/44lKKUT) - 1x each
- [Ferrite bead pack](https://amzn.to/3SVQRNa) - 1x

**Battery sensing and radio antenna**
- 1x 100k ohm resistor and 1x 22k ohm resistor from the [resistor pack](https://amzn.to/4aNJ0Yb)
- 1x [TI.10.0111 433 MHz antenna](https://www.digikey.com/en/products/detail/taoglas-limited/TI-10-0111/3131969)
- 1x [6-inch U.FL-to-SMA coaxial cable](https://link.amazon/B06qBxrV7)

**Optional FPV equipment**
- [AKK BA3 AIO FPV module](https://amzn.to/4yjdSJW) - 1x
- [SoloGood FPV Monitor](https://amzn.to/4fwKjxb) or compatible analog goggles
- [JST-PH 2.0 Connector](https://amzn.to/4guRMOn) - 1x
- [Two-piece printed protective frame](https://www.thingiverse.com/thing:7229291)

**Optional diagnostic tools**
- [RTL-SDR](https://amzn.to/44UV46q) and [NanoVNA](https://amzn.to/4pmRmw0)

## Avionics
The first area we'll focus on is *Centauri's* avionics package. As mentioned in the opening section above, the avionics package is like the central nervous system and "brain" of the quadcopter. Generally speaking, it observes the real-world environment, compares it to a set angular velocity goal, and then determines how to **close the gap** between the two; and *that* is a flight controller described in a single sentence!

Several components make up the avionics package:

![avionics](https://i.imgur.com/d1MwR1Y.png)

**Microcontroller**: the microcontroller is the "brain" of the entire quadcopter operation. It runs firmware, called the "flight controller", that performs a number of operations at a very rapid rate to achieve flight - but more on that in the next chapter! Within the propulsion chain, the microcontroller's role is to provide the **throttle signal** (in [Pulse Width Modulation](https://en.wikipedia.org/wiki/Pulse-width_modulation), or PWM, format) to each of the four ESCs (throttle from 0-100%), controlling the speed of each of the four motors to vary the thrust each propeller provides.

For *Centauri*, I used a low-cost, widely available, and easily accessible microcontroller: the [Raspberry Pi Pico](https://amzn.to/4vZ5DkH). The Raspberry Pi Pico is a development board built around the Raspberry Pi RP2040 microcontroller chip, and it can be programmed in MicroPython, C, or C++.

**Inertial Measurement Unit (IMU)**: in order for the microcontroller to determine what level of throttle to apply to each of the four motors, it must be able to observe its current orientation (or rather, more likely, the *rate of change in its current orientation*). The onboard IMU is a sensor that allows the microcontroller to continuously observe this many times per second!

In *Centauri* I used the [MPU-6050](https://amzn.to/4yh76Ev), a very common, low-cost IMU that has both a 3-axis accelerometer and a 3-axis gyroscope built into it, providing 6 degrees of freedom.

**Wireless Serial Transceiver**: the quadcopter needs to be in constant communication with the pilot, who provides constantly-changing control commands. While there are many wireless communication modules I could have used for this project, I opted for the low-cost, widely available, and easy-to-implement [HC-12](https://amzn.to/4eWx48V). The onboard **HC-12** wireless communication module allows for bidirectional serial communication between the quadcopter and the pilot's transmitter device, which also uses an HC-12.

As described in the previous chapter, all three critical avionics elements are securely mounted on the **lower level** of the airframe:

![avionics mounted to lower level](https://i.imgur.com/CpW4sjG.png)

## Propulsion
What physical components onboard the quadcopter allow it to actually lift off? Enter the **propulsion** package!

![propulsion](https://i.imgur.com/Z8S0C7f.png)

**Propellers**: the propellers on a quadcopter are arguably the most important component! The propellers are what spin and push air downward, producing the downward pressure that creates lift and allows the quadcopter to achieve flight.

Trust me, you could do a *very* deep dive into the science behind propellers and get very particular about exactly which propeller is best for the job. Material, diameter, pitch, shape, tip - there are *a lot* of factors you can evaluate and get very picky about! In my case, I purchased [this 16-pack of 5-inch, tri-blade propellers](https://amzn.to/3QQwuAt) (4 sets) and had a ton of success! These were exactly what I needed for my project and have proved quite durable after many crashes.

**Brushless Motors**: as the name *quadcopter* suggests, the drone has **four** motors, each independently controlled in thrust level to achieve stable flight and perform maneuvers. The motors are a critical component, as they are what spin the propellers to produce lift!

While I went with very high-performance motors in my previous quadcopter build, [Scout](https://timhanewich.medium.com/taking-flight-with-the-raspberry-pi-pico-micropython-diy-quadcopter-drone-61ed4f7ee746), for *Centauri* I opted for middle/low-performance motors. I used four Readytosky 2300 KV Brushless DC Motors, purchased on Amazon [here](https://amzn.to/44lyILf). The **KV value** of 2300 means that for every one volt applied to the motor, it is capable of spinning an additional 2,300 RPM. So at 14.8 volts (4S LiPo), these motors can spin at 34,000 RPM under no load. A high KV value like this is important for spinning propellers, as high speed is needed to move air and create lift efficiently.

![motors](https://i.imgur.com/xHjQw91.png)

The motors connect to their ESCs through short intermediate wires with insulated splices and strain relief, as shown in the build guide. This avoids pulling directly on the ESC pads when the motor leads move. Wire size must suit the motor current; these are power connections, not signal wires.

**Electronic Speed Controllers**: in the picture of the motors above, you'll notice each motor has **three** wires stemming from it. That may surprise you at first if you're more familiar with traditional *brushed* DC motors, which have only two wires: a positive and a negative. A brushless DC motor ("BLDC") has three wires to allow for the rapid switching of magnetic poles within the motor itself, which is what causes the rotor to begin rotating.

However, that switching of the magnetic poles within the motor is *very* fast - as in many tens of thousands of times per second! This switching rate, usually between 20,000 and 100,000 times per second, exceeds what a normal microcontroller can achieve. Because of this, quadcopters that use BLDCs typically have four **Electronic Speed Controllers** (ESCs) onboard, solely responsible for rapidly switching the supply of electricity to each of the four motors, changing the polarity of the stator within each motor and causing the rotor to turn.

![escs](https://i.imgur.com/zaQtQOr.png)

In the image above you'll see the ESCs I used for *Centauri* mounted to the frame. I purchased these ESCs as a [4-pack from Amazon](https://amzn.to/3SMnnBr) and was very pleased with their compact footprint and light weight.

Note that, if it's your first time using ESCs with a brushless DC motor, you may find they don't work right out of the box! This is because they need to be calibrated: in other words, they need to be "taught" the *minimum* and *maximum* throttle signal values they'll be provided. There are plenty of videos online covering this calibration process - be sure to watch those and familiarize yourself with it! For my previous quadcopter, *Scout*, I wrote a lightweight 4-way (all-at-once) ESC calibration script that you can find [here](https://github.com/TimHanewich/scout/blob/master/bonus_code/esc_calibration.py) and use to calibrate your own ESCs.

IMPORTANT: be mindful of motor direction! In a quadcopter, two of the motors turn *clockwise* while the other two turn *counter-clockwise*, in an "X" pattern: the front-left and rear-right motors turn clockwise, while the front-right and rear-left turn counter-clockwise. You don't need to keep this in mind while mounting the motors to the frame; the direction a motor turns has everything to do with how the ESC is wired to it. While wiring the motors to the ESCs, if you have a motor turning in the *wrong* direction, simply swap any two of its three leads to the ESC and it will reverse direction! It's also important to match the correct CW or CCW propeller orientation to the matching CW or CCW motor rotation to achieve the downward lift we're looking for.

## Power
The *Centauri* quadcopter is designed to be powered by any lithium battery supply ranging from **2S to 4S** (two, three, or four lithium cells in series); this means the overall system is capable of accepting a supply voltage **as high as 16.8 volts** (4S, fully charged) and **as low as 6.0 volts** (2S, fully discharged).

**Battery**: You can use any battery you'd like, but I have used and had success with a [4S 3300 mAh Lithium Polymer Battery](https://amzn.to/3RwAqq7). Normally a smaller battery pack with much less capacity is used on FPV quadcopters, but a high thrust-to-weight ratio was never my goal anyway, so I don't mind using these ones I had lying around!

The battery you purchase will almost certainly use the [XT60](https://www.google.com/search?q=xt60+connectors) connector, a very common connector in RC vehicles, drones, and other robotics. I purchased an inexpensive [pack of XT60 connectors](https://amzn.to/4vwD25n) and used one as the female end to plug the battery in, supplying electrical power to the entire Centauri system.

Note that I have experimented with alternative supplies: a [2S 18650 Li-ion pack](https://x.com/TimHanewich/status/1993492243664265347/video/1), a [2S 21700 Li-ion pack](https://x.com/TimHanewich/status/1993667177304707417/video/1), a [3S 21700 Li-ion pack](https://x.com/TimHanewich/status/1993678881501376795/video/1), and a [4S 18650 Li-ion pack](https://www.youtube.com/watch?v=FT0rBtNr84A), all with limited success. The 3S 21700 pack and the 4S 18650 pack provided decent results, but did not pack the same punch as my 4S LiPo workhorse.

The supply current from the battery directly powers the ESCs and motors. But what about the other onboard components that require a much lower voltage?

**MP1584EN Buck Converter**: an MP1584EN module is used to step battery voltage down to a regulated 5V supply. The ESCs receive raw battery power; the Pico and HC-12 use the regulated supply, and the MPU-6050 receives 3.3V from the Pico. The carrier board routes these connections.

Before connecting the regulator output to the rest of the electronics, verify it is set to 5V with a multimeter. Match the carrier board's VIN pads to the module's VIN terminals and VOUT pads to VOUT, with positive and ground matched on each pair. The build guide shows the mounting and connections.

![MP1584EN regulator mounted beside the radio and carrier board](https://i.imgur.com/BdDh9rQ.png)

A buck converter regulates its output within its specified input range and load limits. Set and check the output before connecting sensitive electronics; do not assume that a module arrives adjusted correctly.

The carrier board provides positions for the capacitors and ferrite bead described in the build guide. Populate those as shown to complete the power-filtering connections.

While building *Centauri*, I learned that managing and regulating the power supply fed to the other critical and highly-sensitive modules onboard is very important for performance and reliability. The ESCs, described in the "Propulsion" section above, rapidly switch the current provided to the motors (at several thousand times per second), and this rapid switching can introduce serious [**electrical noise**](https://claude.ai/share/f9b4ea50-dac4-44b4-b492-9cfcd169bb15) that ripples throughout the electrical system. The good news is that I figured out a decent way to combat this (for the most part), and I'll share all about it below!

I discovered this after some pretty severe accidents. The *Centauri* quadcopter was severely limited in range - at only tens of meters away, it would struggle to receive clean signals from the pilot's transmitter, often resulting in crashes. Upon further testing with an [RTL-SDR](https://amzn.to/44UV46q), I found there was a *serious* amount of noise coming from the antenna on the quadcopter, even while idling at a low RPM.

![example gif of crash due to Rx cut out](https://i.imgur.com/Sd3Yyyz.gif)

*The above shows an example of a crash due to a Rx communication issue.*

I made some changes, described below, that drastically reduced the noise in the system, leading to a much cleaner signal received by the antenna and HC-12, and boosting range and performance:

**10 uF Capacitor** and **0.1 uF Capacitor**: these help reduce supply noise and are soldered into their labeled carrier-board positions. The 10 uF capacitor is polarized; match its positive lead to the board's positive marking. The [10 uF capacitor](https://amzn.to/4bFcebU) filters out low-to-mid frequency noise while the [0.1 uF capacitor](https://amzn.to/44lKKUT) filters out high-frequency noise. Both act as a small local charge reservoir that can be drawn upon when minor disturbances in the supply voltage occur, "smoothing" out the stability of the voltage supplied to the HC-12.

**Ferrite Bead**: solder one bead into the carrier board's labeled BEAD position, as shown in the build guide. A ferrite bead helps reduce high-frequency interference on the power supply while allowing DC power through. It works with the capacitors to help keep electrical noise from the ESCs out of the radio's supply. I used a bead from [this pack](https://amzn.to/3SVQRNa).

After implementing the capacitors and ferrite beads, I saw quite a bit of improvement in the ambient electrical noise present while the ESCs are operating:

![before and after ferrite beads and capacitors](https://i.imgur.com/gHiBzPP.png)

As you can see above, the severe noise pollution from the ESCs was drastically reduced by implementing the capacitors and ferrite beads; this improves the ability of the highly-sensitive HC-12 to receive messages from the transmitter.

## Passive Components
In addition to the "active" components above, which play a direct role in the functioning of the all-up quadcopter system, there is also a "passive" category that is part of the electrical design purely for informational purposes. As I mentioned in a previous chapter, a big goal I had with *Centauri* that my first quadcopter project, *Scout*, lacked was the ability to detect onboard battery voltage and relay it back to the pilot.

**100,000 Ohm Resistor** and **22,000 Ohm Resistor** as a **voltage divider**: the Raspberry Pi Pico I used as the microcontroller has several analog-to-digital pins that allow it to read the voltage on a pin, ranging from 0.0 volts to a maximum of 3.3 volts. A voltage divider lets us "divide" the raw supply voltage down into a portion that falls within that readable range, from which we can infer the full voltage of the battery. I used resistors from [this pack](https://amzn.to/4aNJ0Yb) that I purchased.

You can read more about voltage dividers [here](https://ohmslawcalculator.com/voltage-divider-calculator), but the gist is that a voltage divider with an R1 resistor of 100,000 ohms and an R2 resistor of 22,000 ohms divides the supply voltage down to 18% of itself, meaning a fully charged 16.8v 4S LiPo battery would be divided down to 3.03v and a fully depleted 12v 4S LiPo battery would be divided down to 2.164v - both well within the safe range for the Pico's ADC pins.

![voltage divider](https://i.imgur.com/dk0OZye.png)

Knowing the fixed proportion of divided voltage to full voltage, and reading the divided voltage within that range, we can then do some basic math onboard the quadcopter to infer the *actual* voltage of the battery! We simply divide whatever voltage is read on the Pico's ADC pin by 0.18 to get the actual supply voltage of the battery.

**All-in-one FPV Module**: another capability I had very much wanted in my previous quadcopter, *Scout*, was the ability to fly via an onboard camera! By adding an onboard camera that streams an FPV video feed back to the pilot, you become able to perform significantly more complex maneuvers using the onboard perspective. For this, I added the [AKK BA3](https://amzn.to/4yjdSJW), an AIO ("all-in-one") camera, transmitter, and antenna module. All it needs is a stable 5v power supply, and it will continuously broadcast an analog video signal, viewable through analog-capable FPV goggles or monitors!

While flying with the FPV AIO module onboard, I noticed that the very tip, where the 5.8 GHz antenna attaches to the body, is very fragile and *very* prone to breaking if the quadcopter flipped over and drove this tip into the ground. So I designed this simple yet effective two-piece frame that extends above the height of the fragile tip, designed to take the brunt of any impact and protect the FPV AIO module itself.

![FPV AIO Module protective frame](https://i.imgur.com/Ar4QQVT.png)

This AIO module frame and all other assets are available on [Centauri's GitHub repo](https://github.com/TimHanewich/centauri).

With the FPV AIO module onboard the quadcopter body with a 5v supply, all we have to do to watch its live transmission is get our hands on analog FPV goggles or a FPV monitor! I purchased the [SoloGood FPV Monitor](https://amzn.to/4fwKjxb) and have had a lot of success with it for flying the quadcopter *and* recording the video feed via its onboard DVR.

**433 MHz Antenna**: an external antenna on the rear-left mast connects to the HC-12. Chapter 3 explains the trade-offs behind antenna placement. The [shop](../../shop/#quadcopter-parts) lists the antenna and cable. Reception varies with installation and surroundings, so test your own link before flying and comply with local radio rules.

Let me tell you, finding and using *the right* antenna proved harder than I thought! I assumed it would be as simple as picking a 433 MHz antenna off of Amazon and being done. This is *not* the case; in the world of antennas, none is *exactly* perfect, and you have to be very discriminating about which you use.

Long story short, I purchased and used the [TI.10.0111](https://www.digikey.com/en/products/detail/taoglas-limited/TI-10-0111/3131969) by Taoglas Limited, purchased through Digikey. I bought a pack of four, and all four tested with SWRs of 2.0 and below, [one even at 1.05](https://i.imgur.com/I65SBzN.jpeg). I also purchased [a NanoVNA](https://amzn.to/4pmRmw0) to test the resonance (performance) of the antennas. Warning: I do not recommend trusting antennas purchased on Amazon or other consumer retail sites; I did originally and found *awful* performance from these antennas: poor SWRs and incorrect tuning bands. I highly recommend purchasing your 433 MHz antenna from a reputable retailer that provides datasheets; the quality control should be much better!

**U.FL to SMA Coaxial Cable**: if you *do* go down the "Configuration B, C, or D" route with an external antenna, you will need to purchase a U.FL to SMA coaxial cable: this is the cable that connects the 433 MHz antenna to the HC-12. The antenna screws into one end of the cable while the other snaps into the HC-12.

A 6-inch U.FL-to-SMA cable connects the rear-left HC-12 to the mast-mounted antenna. Follow the [parts list](../../shop/#quadcopter-parts) and secure the cable to avoid pulling on the small U.FL connector.

## Wiring

![Legacy wiring diagram — replace with updated carrier-board connections](https://i.imgur.com/0YmcytB.png)

*This diagram shows the earlier point-to-point build; follow the current build guide for carrier-board assembly.*

The carrier board handles electrical routing. Populate the board, then solder the external components to its labeled pads following the [build guide](../quadcopter-build-guide/). It saves you from creating the routing by hand.

Keep these assembly checks in mind: circular power pads are positive and square power pads are ground; battery and ESC power leads use the larger holes and suitably rated wire; signal connections use the smaller holes. Match ESC1 to front left, ESC2 to front right, ESC3 to rear left, and ESC4 to rear right. Check polarity and regulator output before applying power, and keep propellers off during assembly and initial testing.

Battery power feeds the ESCs, regulated power feeds the avionics, and the voltage divider lets the Pico measure battery voltage. The Pico sends a separate throttle signal to each ESC. The carrier board routes those connections to labeled positions, so assembly does not require working through GPIO numbers. Schematics and source files are available in the [Centauri repository](https://github.com/TimHanewich/centauri) if you want to explore further.

## The Finished Product
So what does the airframe, fully printed, look like with all of this hardware onboard and wired up together? See below!

View from the front:

![front](https://i.imgur.com/bJAhBok.jpeg)

View from the side:

![side](https://i.imgur.com/ZygvM4N.jpeg)

View from the rear:

![rear](https://i.imgur.com/c21DvcF.jpeg)

The carrier board keeps the connections organized, leaving fewer wires to route by hand. Here is the lower electronics bay, also shown in the assembly guide:

![Carrier-board build with the Pico, IMU, radio, and regulator installed](https://i.imgur.com/8bvDEF0.png)

You still need to keep external wires short enough to fit, insulate splices, and secure them away from moving parts.

Assembled weight depends on your battery, camera, printed parts, and wiring. Weigh your completed aircraft with its flight battery and any accessories fitted; filament weight alone does not tell you the aircraft's takeoff weight.


![Earlier Centauri build on a scale — replace with current aircraft weight photo](https://i.imgur.com/HzmTECO.jpeg)

*This scale photo shows the earlier build, not the current aircraft's takeoff weight.*

## Close
And now, with our body printed, the hardware assembled onto it, and everything wired up, we are ready to move on to the software phase: the Centauri Flight Controller! In the next chapter I'll detail the role of a flight controller and describe exactly how the Centauri flight controller works to achieve stable flight.

Click here to continue reading in this series: [Full-Stack Flight, Chapter 5: Quadcopter, Part 3: The Flight Controller](../chapter5).

*Ready to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*