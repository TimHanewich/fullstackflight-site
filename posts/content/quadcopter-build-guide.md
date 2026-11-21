---
id: quadcopter-build-guide
title: 'Centauri Quadcopter Build Guide'
description: 'A step-by-step guide for building the Centauri Quadcopter.'
---

# Centauri Quadcopter: Build Guide
Welcome to the *Centauri Quadcopter* build! This guide walks you step by step through assembling a custom quadcopter, from its 3D-printed airframe to the electronics powered by a Raspberry Pi Pico running MicroPython.

Centauri is the open-source drone ecosystem behind *Full Stack Flight*, built around a simple idea: **learn the whole drone, not just fly the drone.** As you build, you'll get to know the components that sense motion, receive pilot commands, and turn those commands into motor movement, without hiding the engineering inside a black box.

Expect some soldering, careful wiring, and troubleshooting along the way. Take your time, double-check your connections, and keep propellers off during assembly and initial bench testing. Let's go!

## Acquire Necessary Components
There are numerous components needed to build the *Centauri* quadcopter. See [shop](../shop) for a full list of these components and where to buy them!

## 3D Printing
Before we can build our quadcopter, we first must fabricate the body! The body of the Centauri Quadcopter is fully 3D-printed with the design files themselves being freely available to everyone!

![on thingiverse](https://i.imgur.com/njYvCxp.png)

You can use a 3D slicer tool like [Cura](https://ultimaker.com/software/ultimaker-cura/) to drag these parts (`.stl` files) and prepare a print on whatever 3D-printer you have access to. Normal PLA will work and is certainly light enough!

![on cura](https://i.imgur.com/RtH0Uqt.png)

While I'm not showing pictures of every part being printed, here are a few cool shots!

The finished lower level and IMU frame:

![ll and imu](https://i.imgur.com/cqa1s9w.png)

Two arms being printed:

![arms printed](https://i.imgur.com/BSvSEuq.gif)

After you finish the print, add a small piece of double-sided foam tape to the MPU6050 (IMU) frame. This foam tape will secure the MPU6050 to the frame, doing a significantly better job filtering out high frequency noise (vibrations) than screwing it in directly would do.

## Carrier Board Setup
The critical ingredient! Next we will prepare our *Centauri Flight Controller Carrier Board*, a printed circuit board, to serve as the "nervous system" of the quadcopter, handling all necessary electrical components between components we will later add.

![board](https://i.imgur.com/W8DuJQv.gif)

First, a look at the anatomy of the Carrier Board.

**Wire sizes:** The board has two sizes of wiring holes. The larger holes for the battery leads and ESC power leads accept thicker **16 AWG wire** for higher current. Use **22 AWG wire** in the smaller holes for signal and other low-current connections, not motor power.

![anatomy](https://i.imgur.com/N2GZNbZ.png)

As you can see above, a lot of electrical components are packed into a fairly small package. Later, you will be adding these electrical components to the airframe (MPU6050, HC12, 5v Regulator, etc.) and soldering a wire connecting the *component* to the *appropriate pad* on the board. There are also some minor electrical components that do get soldered *directly* onto the board (capacitor, ferrite bead, resistors), but more on that later!

Before we move on, let's focus a moment on a very critical part of the Centauri Quadcopter: providing *power* and *signal* to the four motors. An electronic speed controller exists as a middle man between our MCU (RPi Pico) and the motor itself, translating the MCU's signal commands to three-phase switched output for the motors.

![ESC mapping](https://i.imgur.com/IGvGUHp.png)

Mapping:
- **ESC1** is the *front left* ESC/motor pair
- **ESC2** is the *front right* ESC/motor pair
- **ESC3** is the *rear left* ESC/motor pair
- **ESC4** is the *rear right* ESC/motor pair

It is important you know this mapping and hook each ESC up to the correct pads based on its position.

And now, a closer look at each ESC pad:

![ESC pad closer look](https://i.imgur.com/Ljh2yfV.png)

As you can see in the image above:
- The **Large Square** is the ESC's negative power supply (from the battery)
- The **Large Circle** is the ESC's positive power supply (from the battery)
- The **Small Square** is the signal's ground (from the MCU)
- The **Small Circle** is the signal itself (from the MCU)

The image below, of an ESC, shows each of these wires, labeled.

Ok, now to start setting up the carrier board! First we will add the Raspberry Pi Pico to the board, serving as the MCU (Microcontroller Unit), the "brain" of the Centauri Quadcopter.

Get your board handy!

![pic of board](https://i.imgur.com/E1IihSN.png)

Add a set of 20 header pins in the Pico's footprint. I am using helping hands here to hold the board for me.

![add header pins](https://i.imgur.com/t7PuCaW.png)

With those header pins added, we will want to solder the pins to the board *underneath* the board, seen here. 

![underneath](https://i.imgur.com/LK7zhOl.png)

It can be a bit tricky, but with the board in this position, apply some solder with your soldering iron to the header pin **at the very end**. Just that one pin for now!

![end soldered](https://i.imgur.com/WdrLse9.png)

*Note: in the picture above, I have two pins soldered at either end. I'd recommend only doing one pin at this stage.*

The reason we only solder one pin first is because we want to be able to make any tweaks of position of the header pins necessary *before* soldering the remaining. Once you solder multiple pins, it becomes very difficult (if not impossible) to heat up all pins at once with a soldering iron to make necessary corrections in position. So, using your soldering iron, heat up the solder at that one pin, using a gloved hand, reposition the pins just a touch to ensure they sit flush against the board and are facing upwards. Once pleased with their position, then remove the soldering iron, let the pin cool. Now your header pins should be in a good position, ready for you to "lock in" the position by soldering the remaining.

*Note: if you made the mistake, like I have, of soldering them all too early, all is not lost. You can use pliers to gently bend the header pins back into a position that the RPi pico can then slot into. It may take a few tries, but be patient and gentle!*

Once pleased with the position of the pins, continue to solder all of the header pins down to their pads on the board, completing the electrical connection. Be sure they don't touch, which would cause a short!

![all_soldered](https://i.imgur.com/iY5MuKH.png)

With your pins soldered in and in position, slide your pico on. Again, as long as the pins were soldered correctly, it should slide on relatively easily if alignment is correct. If not, not a big deal - you should be able to make minor modifications by bending the pins with pliers.

And now with the pico slid on, apply solder to the *top* of the pins where they meet the pico's pads, completing the electrical connection.

![solder_pico](https://i.imgur.com/qlzoPu6.png)

Next we will solder on the capacitors, both the 0.1 uF capacitor and the 10 uF capacitor. The 0.1 uF capacitor is a ceramic capacitor and does not have a positive/negative terminal - both legs are interchangeable! However, the 10 uF capacitor *does* have a positive/negative terminal! It is very important you get the legs in the right holes.

![caps in board](https://i.imgur.com/uhgj3Vk.png)

Shown closely below, the *longer* leg of the 10 uF capacitor is the positive end. The *shorter* leg is the negative end. Ensure you are placing the longer leg in the hole marked with the "+" (positive).

![closer caps in board](https://i.imgur.com/1HKbhaC.png)

Wonderful! Now the capacitors are on.

Next, do the ferrite bead. The ferrite bead needs to be soldered where "BEAD" is on the board, in either direction. *Note: if you do not have a ferrite bead, you may not necessarily need it. Simply connect the two ends with some wire.*

Do the same with the resistors: solder them in where they belong, either direction and orientation is fine. *Note: if you can't tell the ohm value for each (can't tell them apart), use a multimeter to test their resistance.*

Finally, solder in "placeholder" wires to the remaining pads (holes) on the board that will be used: for the battery leads (middle of ESC pads), all four ESCs, the 5v regulator, MPU6050, and HC-12. 

![all_soldered](https://i.imgur.com/Krd50n6.png)

After we add the electrical components (e.g. MPU6050, HC12, 5v Regulator) to the airframe later, we will connect to the board via these placeholder wires that are currently unconnected!

## Lower Level Assembly
Now, with our carrier board ready to go, it is time to begin assembling the drone's lower level, which will hold the internal electrical components that allow the drone to fly.

Using four M2 screws, screw in the carrier board to the lower level of the airframe. Using four M3 screws, screw the MPU6050 frame (with the MPU6050 attached via the double-sided foam tape) just below the board. Ensure you have the MPU6050 in the orientation I have it in in the picture (mounting holes facing forward, pins towards the rear).

![lower level pcb and mpu6050](https://i.imgur.com/iEqxfzY.png)

At the other end (rear) of the lower level, the HC-12 radio communication module has a position at the very back left corner, closest to where the antenna mast will eventually be situated. The HC-12 has no mounting hole for a screw, so four holes are there to accommodate two zip ties to firmly hold it down. As you can see in the picture above, it makes the most sense to position it in this orientation: wires facing forward, where they will eventually feed towards the carrier board and U.FL port facing rearward, where a wire will eventually feed towards the antenna mast.

![HC-12](https://i.imgur.com/XfoyiiW.png)

![HC-12 underneath](https://i.imgur.com/mQKbjTy.png)

Next, secure the MP1584EN 5v regulator in this position. Again, it lacks a mounting hole for a screw so two holes are positioned there for using a small zip tie to securely hold it down. The orientation matters a bit less than the HC-12 so you can flip it around either way you want... just be very sure to note which side is "VIN" (raw battery voltage) and which side is "VOUT" (5v power out) and hook those ends up to the correct pads on the GPIO later!

![all components](https://i.imgur.com/ynpOb9W.png)

![all components video](https://i.imgur.com/wkcn345.gif)

And now, the completed lower level! Excellent work, the electrical components are now all fastened and ready to be wired together.

As you can see in the pictures above, every component that was added to the lower level I had prewired with "placeholder" wires. That is a personal preference and I have found it easier to solder these wires on *before* mounting them to the lower level instead of soldering them after fastening. It is up to you, but I'd highly recommend this method! And now, we can simply splice the placeholder wires from the carrier board with the placeholder wires of each component.

First, a brief tutorial on my "splicing" method. The video below shows how I use pliers to bend the ends of each placeholder wire into a small hook, hook them together, squash them, apply solder, and slide a heat shrink wrap over them.

https://www.youtube.com/watch?v=iXqHNFa4GMs

Rinse and repeat this for every necessary connection between each component and the carrier board. **IMPORTANT: after completing all connections, double check your work.** If any mistakes are made, particularly with the power supplies, you could very easily permanently fry your components. A 5-minute check confirming every wire of the carrier board is hooked up to the correct component pad is worthwhile!

After you finish, it should look something like this. You'll notice I also did my best here to trim the wires down so any excess wire is not "bundled up" in the lower level and also more weight the drone has to unnecessarily carry around.

![spliced](https://i.imgur.com/8bvDEF0.png)

At this stage, with the core electronics wired up (the carrier board, the 5v regulator, the IMU, and the HC-12), we *technically* have the "brain" of the quadcopter able to operate. You can flash the Centauri Quadcopter flight controller software (found [here](https://github.com/TimHanewich/centauri/tree/master/components/quadcopter/src) on GitHub) to the Raspberry Pi Pico using [Thonny](https://thonny.org/) and a USB cable (after flashing the latest version of MicroPython to your pico). I'll expand on how to do this in the future, but for now, there are plenty of tutorials you can find online through a simple internet search, like [this good one](https://www.youtube.com/watch?v=_ouzuI_ZPLs) for example.

With the Centauri Flight Controller software loaded onto the pico, as soon as the pico gains power, it will boot up the flight controller code and begin trying to operate: verifying connection of the IMU and readability of data, diagnostic communication with the HC-12, and more.

![power supplied](https://i.imgur.com/WIBDIdI.png)

At this stage, if you have a way of directly providing a 6.0 to 16.8 volt (the tolerable voltage range the Centauri Quadcopter is designed for, representing 2S-4S), you can technically power it up and verify it operates! **NOTE: be very careful doing this. ONLY provide 6.0-16.8 volts. Be VERY careful to ensure you are connecting the negative end and positive end to the correct placeholder wires of the carrier board. The circular "BATTERY" pad is positive, the square is negative.** And don't let the two wires touch (short) during this. Only do this at this stage if you want to and trust yourself to not make mistakes.

![power supplied video](https://i.imgur.com/vK9ycqX.gif)

As you can see above, I am using my DC power supply to supply ~12.9 volts (a mostly discharged 4S LiPo's voltage).

The *Centauri Flight Controller* should now be awake! Upon powering it up, you should see the small green LED at the front of the pico turn on solid, hold that for ~5 seconds (it goes through a setup and short calibration phase upon boot), and then proceed with normal operations in which every 0.5 seconds the LED switches between on and off. If you see that - you are good! If you do *not* see that, here is what that might mean:
- **No LED light at all?** Ensure all electrical connections are made correctly. Ensure the flight controller code is flashed correctly. Ensure no component is physically or electrically damaged (perhaps something was damaged from excessive heat from a soldering iron or reverse voltage, which could be permanent).
- **LED light pattern of on for one second, off for one second, and it cycles?**: the good news is your Pico has power and the flight controller is running! The bad news is this is the standard pattern to indicate some type of failure/issue was encountered. Something has gone wrong during boot or standard operations such as it failed to access IMU data from the MPU6050 (or configure it) or was not able to communicate with the HC-12 to configure it or verify it is even connected. I recommend plugging your Pico back into your PC via USB, and running `main.py` of the flight controller code directly in Thonny so you can *see* the diagnostic printouts the Pico provides in the terminal which will clearly state why an error is being encountered. Disconnect the DC power supply first before doing this.

Next, move on to completing the lower level electronics bay: adding the battery power connector. You already have two placeholder wires in the carrier board that will carry the power from the battery *into* the board. We will splice a longer wire to those, running it down through the rear of the lower level and out the back where a XT60 female connector will be available for the LiPo battery you use to plug into, supplying power to Centauri!

Again, you can use the "hook" splicing method showcased in the video you watched above. This time, it is obviously with a bit thicker wire which can make it a bit more challenging, but certainly still doable.

![power hook](https://i.imgur.com/FpjlZOx.png)

![power hook squashed](https://i.imgur.com/FiNKBHb.png)

![power hook soldered](https://i.imgur.com/F15qvmG.png)

And now both the positive and negative power wires should be extended to necessary length to reach the very rear of the lower level where the battery can access it (or maybe you won't need to splice additional length because your placeholder wires are long enough to reach!). 

And now, with each wire cut to the same length, solder each into a *female* XT60 connector. This is the connector most LiPo batteries used in drones have, allowing it to plug into the electrical system of Centauri and supply power through these two wires. *Note: shame on me for using the same color wire for both positive and negative! Obviously using red/black wires would be easier for quick visual reference, but it isn't totally necessary. If you only have one spool of wire, it is fine to use the same color for both... just be sure you are double and triple checking you have the right connections!*

When connecting the ends of the power lead wires with the XT60 connector, the black "cover" (sheath) slides over them first, *then* you insert the wires into their corresponding positive/negative terminals of the XT60 connector. The picture below depicts which sides of the XT60 connector correspond to  negative/positive. As you can see, the positive (red) wire feeds into the "square-shaped" side, the positive side, while the ground (black) wire feeds into the other. Be very sure to match this connection!

![XT60 connection](https://i.imgur.com/23Rsb35.png)

With the XT60 female connector set up at the very end of the power lead wires, you can now use these six holes to wrap three zip ties around the wires securely holding it down to the lower level.

![3 zip ties holding wire leads](https://i.imgur.com/HZ8tOz8.png)

![3 zip ties holding wire leads fastened and finished](https://i.imgur.com/6pnHDg1.png)

![XT60 at the end](https://i.imgur.com/6HF4Flt.png)

Excellent work! And now, after double and triple checking your connections, you should be able to provide electrical power to the Centauri system, this time through a battery itself - the battery you later plan to run the quadcopter on!

![power from battery](https://i.imgur.com/0XTJ2uF.png)

## Setting up the Arms
And now we move onto what makes a quadcopter a quadcopter: four arms! Each arm will support both a motor (later, with propellers) and the ESC "middleman" between the motor and MCU. 

First step: prep the ESCs. As shown below in this picture, we will not be using the standard connector the ESCs come with. To save weight, space, and for simplicity, we will be directly soldering the ESC's wires to the board (or splicing with your placeholder wires) without connectors. With scissors, cut the connector off at the end.

![connector cut](https://i.imgur.com/dU4gVyR.png)

Position the ESC atop the "bridge" of the arm where it will live. You'll see there is a small hole ("U"-shaped in the latest design spec) that all four of the ESC wires can pass through into the electronics bay. Pass the wires through there where later you'll splice them to the board's placeholder wires.

![pass through hole](https://i.imgur.com/LvQtNlx.png)

Next, secure the ESC down to the bridge using a zip tie. You'll see a small hole that the zip tie will pass through and wrap around to secure the ESC down. Pull it tight! It should reach, but if you have trouble reaching, you can link two zip ties together for extra length.

![zip tie to secure ESC](https://i.imgur.com/tHsxRR0.png)

Do this for all four arms.

![all four arms](https://i.imgur.com/OC0suvW.png)

Next, using the M3 screws that each motor came with, screw the motors into the end of the arm. You'll see that four screws are not spaced equally, so you'll need to line them up with the motor's bottom screw holes.

![motor mounted](https://i.imgur.com/hjI7O3h.png)

Like with the ESCs, we will not be using any preassembled connectors on *Centauri*, instead directly soldering the connections where they ought to go! So, these banana plugs can go! Using scissors, cut them off at the base.

![cut off plugs](https://i.imgur.com/u5xOlhe.png)

Next, connect each of the three motor wires to its ESC pad using a short 22-gauge "middleman" wire, rather than soldering the motor wires *directly* to the pads. Solder each motor wire to an intermediate wire, insulate the splice with heat shrink, and solder the other end of the intermediate wire to the corresponding ESC pad.

**PRO TIP:** My earlier direct connections eventually broke loose and caused flight issues. I've found the motor --> wire --> ESC connections hold much better on my build. Whatever method you use, inspect your solder joints and secure the wiring so vibration and movement do not pull on the pads.

The photo below shows the *older direct-soldering (without the "middleman wire") approach*, not the recommended method:

![solder motor to ESC pads](https://i.imgur.com/gsGA5OP.png)

The next picture shows the recommended "middleman" wires on my well-used quadcopter. The remaining build pictures were captured before this change, so they still show the older approach.

![pro-tip middleman wire](https://i.imgur.com/v7BhapZ.png)

Now, all four arms should be prepped with the ESCs, the motors, and the wires passing through the holes in the arms where you will later connect them to the carrier board! You'll also see that any slack remaining in the motor wires (if you did not want to cut it down) can be securely fastened to the side of the arm via zip tie to ensure it doesn't hit the propeller during flight.

![all four arms, ready](https://i.imgur.com/H5m95Ij.png)

Now, using eight M3x30mm screws (two per arm), connect the arms to the lower level. I *highly* recommend screwing from the *bottom-up*, not *top-down*. Screwing from the bottom-up allows you to secure the arms to the lower level, still in the quadcopter shape even with the upper level removed. You later can easily fasten/remove the upper level to access the electronics bay by only slightly unscrewing these M3x30mm screws.

![all four arms, attached](https://i.imgur.com/8407Erg.png)

![all four arms, attached video](https://i.imgur.com/e9Bz6Nr.gif)

![all four arms attached overhead](https://i.imgur.com/BSqDo9R.png)

And now to complete the electrical connections of each arm! As you can see, each ESC has four wires you must connect to the carrier board:
- Thick red wire = battery power supply, positive.
- Thick black wire = battery power supply, negative.
- Thin white wire = throttle signal.
- Thin black wire = throttle signal ground.

All of these wires have a corresponding pad it must go to on the carrier board!

![four wires of ESC to splice](https://i.imgur.com/uUvZ6u0.png)

## Complete Electrical Connections
And now to complete the final electrical connections in the Centauri Quadcopter: the ones that will allow it to fly! You will now splice all four wires of each of the four ESCs to their appropriate pads (placeholder wires) on the carrier board. Be sure to reference the picture above in this guide that shows how each ESC group on the carrier board maps to a particular arm (e.g. front left, front right), as connecting them up correctly is vital.

The same splicing method you've already been using will be useful here! Some pictures below show my completed connections.

![splice1](https://i.imgur.com/pX0vHMF.png)

![splice2](https://i.imgur.com/Mn8P610.png)

![splice3](https://i.imgur.com/YMWVt9x.png)

![splice video](https://i.imgur.com/eOagibV.gif)

At this stage, while you still have easy access to the electronics bay, it is also a good idea to connect the **U.FL to SMA** connector to the HC-12's U.FL port. This is the cable that will connect the HC-12 to the antenna which will later sit atop the mast. You can see this depicted in the picture below.

![HC-12 U.FL to SMA](https://i.imgur.com/7rPJOCx.png)

As you will also observe in that picture, I passed the cable *under* one of the zip ties holding down the HC-12. I did this to alleviate strain on the HC-12's tiny and weak U.FL port. This prevents something like a simple bump of the wire from ripping it out. I'd recommend this method (which may need you to cut the zip tie and use another), or you can skip this step at your own risk.

Bravo! With all the connections made, you can now test the end-to-end motor connectivity in its current state.

![video running](https://i.imgur.com/V9xi3f6.gif)

In the video above, you'll see I already assembled the antenna mast and attached to the rear left arm, running the U.FL to SMA cable to the top where a small 433 MHz antenna is attached. At this stage it isn't totally necessary as, even without an antenna, the HC-12 should be able to receive control commands when in close proximity to the transmitter itself. Only a few feet across a room should be doable without the antenna. 

The *Centauri transmitter* is sending out control commands to the *Centauri Quadcopter* to turn the motors on ("arm" it), so be sure to follow the Transmitter build guide to get that end up and running to be able to perform this test!

## Upper Level
Next we move on to the upper level of the Centauri airframe, the top that will cover the electronics bay you have been working in! The upper level is quite self-explanatory: one single long piece (same dimensions as lower level), with the optional "GoPro" mount at the front, secured to the upper level via M3 screws if you want it for recording or FPV flying.

Before you secure the upper level to the quadcopter, prepare velcro strips that will be threaded behind it to secure the LiPo battery to the top during flight. 

![velcro](https://i.imgur.com/qjLj1fp.png)

As you can see in the picture above, they thread through the upper level on both sides, running into the electrical bay and then back out, eventually reaching around the battery to pull it snug against the upper level. 

First start with very long velcro straps with plenty of extra slack. Then, with your battery positioned on top (this is my chunky 3,300 mAh 4S pack), pull them down against it and make a cut with scissors where you feel is best to wrap all the way around it without any excess slack getting in the way.

![cut to length](https://i.imgur.com/xkkK90w.png)

*Note*: One more thing to note here, which you may see in pictures further down. These velcro straps are good, but don't give me quite the confidence I need that it will secure it in place during a high-performance flight. As the picture below shows, I usually place some double sided foam tape *between* the position of those velcro straps and then wrap some blue painters tape around the battery, pressing the blue taped area into the foam tape. This sticky foam tape securely holding the blue painters tape is quite secure! And when wanting to change the battery, I simply peel back that foam tape until the battery is free, and then use the same blue tape to wrap around the next battery, treating the blue tape a lot like a strap!

![blue tape](https://i.imgur.com/SYAZVZy.png)

With the upper level ready to go (with/without the foam and blue tape at this stage), align it on the top of the quadcopter, lined up with the eight M3 holes where they need to be for the M3*30mm screws to continue through them, securing it to the airframe. Use M3 nuts to secure the screws down firmly.

![screw it in](https://i.imgur.com/RpL3OXv.png)

And as seen in the picture below, hopefully your wires in the interior bay are not very compressed and squashed! If you did a decent job splicing them and keeping the connections neat and orderly in there, yours should be fine like mine!

![interior](https://i.imgur.com/iXkgF0R.png)

## Motor Direction Testing
Congratulations, your quadcopter is now assembled! Before we can even begin testing for flight, we first must validate that the motors are spinning in the right direction; and if they are not, make corrections. Fortunately, making a direction correction at this stage is quite easy as long as we detect it.

First, we have to understand, based on the wiring you did, what direction each motor is turning in right now. The easiest way to do this is run the quadcopter at a very low, safe throttle (i.e. 8%) with blue tape attached to clearly visually see the direction it turns in:

![blue tape on motors](https://i.imgur.com/J3q0uBU.png)

With the blue tape on each motor, it makes it much easier to see the direction it is moving in, either clockwise or counter-clockwise. And if you can't tell visually, place your finger against it and you will feel it hitting either side which you can use to deduce its direction.

![video of blue tape turning](https://i.imgur.com/OFMrsTZ.gif)

Now, with the direction of each motor noted, compare to the *correct* directions of each motor, depicted below:

![motor directions](https://i.imgur.com/ooZAuIK.png)

As seen above, the correct directions are:
- Front Left: Clockwise
- Front Right: Counter-Clockwise
- Rear Left: Counter-Clockwise
- Rear Right: Clockwise

If you have any that are *not* spinning in the correct direction, don't worry! Changing the direction is simple. Literally all you have to do is unsolder any two motor wires (you pick!) from their ESC pads and *swap* them. That is it! 

![swap pads to inverse direction](https://i.imgur.com/NtJtRON.png)

After performing these swaps on the necessary motors, try the blue tape test again - hopefully now your motors spin in the correct direction!

Now, with your motors spinning in the right direction, it is time for a props-on test! A very simple thrust test to validate it can throttle up and produce thrust (moderate to high current draw) without any issues.

Attach your props to the top of the motors. **Ensure you are placing the correct direction of props on each motor.** Each prop has a direction it produces downward thrust in (clockwise or counter-clockwise). Ensure you place the CW props on the CW motors and vice versa. You can tell them apart by the way they appear to "push" air down in whichever direction they spin in.

Great! Now the quadcopter is able to produce downward thrust and, with the right flight settings flashed to it, can *in theory* fly! Before attempting a flight, a restrained thrust test can help check its operation under load, but **this is a hazardous test, not a casual bench check. Spinning propellers can cause serious injury, and the aircraft can shift, tip, or break free if the mounting fails. A propeller can also break or detach even if the aircraft remains secured.**

Use a secure, sturdy test fixture and a stable, firmly anchored base designed to withstand the aircraft's full thrust and vibration. Both the mounting points and restraints must be strong enough for the load, without damaging the airframe or interfering with the propellers. Do not hold the aircraft down by hand or assume that adding weight to a loose object makes it safe. **If you cannot verify that your setup is suitable, do not perform this test.**

The pictures below show an improvised setup I previously used: zip ties securing the lower level to a weighted mesh organizer. They document my build, **not a verified safe fixture or a setup to copy without assessing its strength and stability.** Keep people, pets, loose objects, and yourself clear of the propellers and potential debris, wear eye protection, and plan how to stop the motors without approaching them. Never try to catch or restrain the aircraft if it moves; stop the motors from a safe distance.

![secured down 1](https://i.imgur.com/tcO7yJK.png)

![secured down 2](https://i.imgur.com/o3aqrhy.png)

![secured down 3](https://i.imgur.com/rHEKpLz.png)

With the quadcopter secured down and **the battery disconnected and any other power sources removed**, gently turn each propeller by hand to check that it rotates freely without contacting wires, restraints, or the test fixture. Make any adjustments while the aircraft is unpowered.

Once these checks are complete, remove your hands and tools from the propeller area, ensure everyone is clear, and connect the battery to boot the controller. Keep clear of the propellers from this point onward, even before arming: unexpected motor startup is possible. Let the controller complete calibration without touching the aircraft. **Disconnect the battery and wait for all motors to stop before making any further checks or adjustments.**

With it booted up, use the transmitter to arm your quadcopter and then gently raise the throttle to test thrust. It is not recommended to remain at high thrust states like this for long periods of time, only for short bursts. It is a large amount of current being pulled from the batteries and run through the system in this "held down" state, risking frying your electronics.

## Fly!
And that is it! The complete *core* of the quadcopter build. You can also add things like an FPV All-in-One (AIO) module for FPV flying which I will expand on in the future.

![complete look around](https://i.imgur.com/WRwrcy4.gif)

Be sure you also read the *Centauri Transmitter* build guide, a complementary guide to this one for getting your quadcopter up and running!

![fly away](https://i.imgur.com/iVYgeHR.gif)