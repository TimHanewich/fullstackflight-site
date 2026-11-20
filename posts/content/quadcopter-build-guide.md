---
id: quadcopter-build-guide
title: 'Centauri Quadcopter Build Guide'
description: 'A step-by-step guide for building the Centauri Quadcopter.'
---

# Centauri Quadcopter: Build Guide
The following is a step-by-step guide to walk you through the build for the *Centauri Quadcopter*.

## Acquire Necessary Components
There are numerous components needed to build the *Centauri* quadcopter. See [shop]() for a full list of these components and where to buy them!

## 3D Printing
Before we can build our quadcopter, we first must fabriate the body! The body of the Centauri Quadcopter is fully 3D-printed with the design files themselves being freely available to everyone!

![on thingiverse](https://i.imgur.com/njYvCxp.png)

You can use a 3D slicer tool like [Cura]() to drag these parts (`.stl` files) and prepare a print on whatever 3D-printer you have access to. Normal [PLA]() will work and is certainly light enough!

![on cura](https://i.imgur.com/RtH0Uqt.png)

While I'm not showing pictures of every part being printed, here a few cool shots!

The finished lower level and IMU frame:

![ll and imu](https://i.imgur.com/cqa1s9w.png)

Two arms being printed:

![arms printed](https://i.imgur.com/BSvSEuq.gif)

After you finish the print, add a small piece of double-sided foam tape to the MPU6050 (IMU) frame. This foam tape will secure the MPU6050 to the frame, doing a significantly better job filtering out high frequency noise (vibrations) then screwing it in directly would do.

## Carrier Board Setup
The critical ingredient! Next we will prepare our *Centauri Flight Controller Carrier Board*, a printed circuit board, to serve as the "nervous system" of the quadcopter, handling all necessary electrical components between components we will later add.

![board](https://i.imgur.com/W8DuJQv.gif)

First - a look at the anatomy of the Carrier Board.

![anatomy]()

As you can see above, a lot of electrical components are packed into a fairly small pacakge. Later, you will be adding these electrical components to the airframe (MPU6050, HC12, 5v Regulator, etc.) and soldering a wire connecting the *component* to the *appropriate pad* on the board. There are also some minor electrical components that do get soldered *directly* onto the board (capacitor, ferrite bead, resistors), but more on that later!

Before we move on, let's focus a moment on a very critical part of the Centauari Quadcopter: providing *power* and *signal* to the four motors. An electronic speed controller exists as a middle man between our MCU (RPi Pico) and the motor itself, transating the MCU's signal commands to three-phase switched output for the motors.

![ESC mapping]()

Mapping:
- **ESC1** is the *front left* ESC/motor pair
- **ESC2** is the *front right* ESC/motor pair
- **ESC3** is the *rear left* ESC/motor pair
- **ESC4** is the *rear right* ESC/motor pair

It is important you know this mapping and hook each ESC up to the correct pads based on its position.

And now, a closer look at each ESC pad:

![ESC pad closer look]()

As you can see in the image above:
- The **Large Square** is the ESC's negative power supply (from the battery)
- The **Large Circle** is the ESC's postitive power supply (from the battery)
- The **Small Square** is the signal's ground (from the MCU)
- The **Small Circle** is the signal itself (from the MCU)

The image below, of an ESC, shows each of these wires, labeled.

Ok, now to start setting up the carrier board! First we will add the Raspberry Pi Pico to the board, serving as the MCU (Microcontroller Unit), the "brain" of the Centauri Quadcopter.

Get your board handy!

![pic of board]()

Add a set of 20 header pins in the Pico's footprint. I am using helping hands here to hold the board for me.

![add header pins]()

With those header pins added, we will want to solder the pins to the board *underneath* the board, seen here. 

![underneath]()

It can be a bit tricky, but with the board in this position, apply some solder with your soldering iron to the header pin **at the very end**. Just that one pin for now!

![end soldered]()

*Note: in the picture above, I have two pins soldered at either end. I'd recommend only doing one pin at this stage.*

The reason we only solder one pin first is because we want to be able to make any tweaks of position of the header pins necessary *before* soldering the remaining. Once you solder multiple pins, it becomes very difficult (if not impossible) to head up all pins at once with a soldering iron to make necessary corrections in position. So, using your soldering iron, heat up the solder at that one pin, using a gloved hand, reposition the pins just a touch to ensure they sit flush against the board and are facing upwards. Once pleased with their positiion, then remove the soldering iron, let the pin cool. Now your header pins should be in a good position, ready for you to "lock in" the position by soldering the remaining.

*Note: if you made the mistake, like I have, of soldering them all too early, all is not lost. You can use pliers to gently bend the header pins back into a position that the RPi pico can then slot into. It may take a few tries, but be patient and gentle!*

Once pleased with the position of the pins, continue to solder all of the header pins down to their pads on the board, completing the electrical connection. Be sure they don't touch, which would cause a short!

![all_soldered]()

![all_soldered_top]()

With your pins soldered in and in position, slide your pico on. Again, as long as the pins were soldered correctly, it should slide on relatively easily if alignment is correct. If not, not a big deal - you should be able to make minor modifications by bending the pins with pliers.

And now with the pico slid on, apply solder to the *top* of the pins where they meet the pico's pads, completing the electrical connection.

![solder_pico]()

Next we will solder on the capacitors, both the 0.1 uF capacitor and the 10 uF capacitor. The 0.1 uF capacitor is a ceramic capacitor and does not have a positive/negative terminal - both legs are interchangable! However, the 10 uF capacitor *does* have a positive/negative terminal! It is very important you get the legs in the right holes.

![caps in board]

Shown closely below, the *longer* leg of the 10 uF capacitor is the positive end. The *shorter* leg is the negative end. Ensure you are placing the longer leg in the hole marked with the "+" (positive).

![closer caps in board]()

Wonderful! Now the capacitors are on.

Next, do the ferrite bead. The ferrite bead needs to be soldered where "BEAD" is on the board, in either direction. *Note: if you do not have a ferrite bead, you may not necessarily need it. Simple connect the two ends with some wire.*

Do the same with the resistors: solder them in where they belong, either direction and orientation is fine. *Note: if you can't tell the ohm value for each (can't tell them apart), use a multimeter to test their resistance.*

Finally, solder in "placeholder" wires to the remaining pads (holes) on the board that will be used: for the batter leads (middle of ESC pads), all four ESCs, the 5v regulator, MPU6050, and HC-12. 

![all_soldered]

After we add the electrical components (e.g. MPU6050, HC12, 5v Regulator) to the airframe later, we will connect to the board via these placeholder wires that are currently unconnected!

## Lower Level Assembly
Now, with our carrier board ready to go, it is time to begin assembling the drone's lower level, which will hold the internal electrical components that allows the drone to fly.

Using four M2 screws, screw in the carrier board to the lower level of the airframe. Using four M3 screws, screw the MPU6050 frame (with the MPU6050 attached via the double-sided foam tape) just below the board. Ensure you have the MPU6050 in the orientation I have it in in the picture (mounting holes facing forawrd, pins towards the rear).

![lower level pcb and mpu6050]()