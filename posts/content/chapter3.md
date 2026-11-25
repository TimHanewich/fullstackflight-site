---
id: chapter3
title: 'Full-Stack Flight, Chapter 3: Quadcopter, Part 1: Designing a 3D-Printed Airframe'
description: 'Walk through the design of a 3D-printed quadcopter airframe, from fitting electronics to positioning the battery and antenna. Explore four frame configurations and the trade-offs behind each.'
---

# Full-Stack Flight, Chapter 3: Quadcopter, Part 1: Designing a 3D-Printed Airframe
![banner](https://i.imgur.com/VRfvxHI.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](../chapter0). This article contains Amazon affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.*

As mentioned in a previous chapter, one of my goals with the new *Centauri* quadcopter was to design my own custom airframe that I could 3D-print. My previous flight controller, [Scout](https://timhanewich.medium.com/taking-flight-with-the-raspberry-pi-pico-micropython-diy-quadcopter-drone-61ed4f7ee746), relied on a Flamewheel F450 body I purchased off the shelf.

After a month and change of planning and designing, I had a finished body!

![flyaround_1080](https://i.imgur.com/aTfsBlg.gif)

The airframe design files are [on Thingiverse](https://www.thingiverse.com/thing:7429193). Follow the [Quadcopter Build Guide](../quadcopter-build-guide/) for assembly instructions.

The lower electronics bay holds the Pico on its carrier board, the MPU-6050, an HC-12 at the rear left near the antenna mast, and an MP1584EN 5V regulator. The frame keeps these components accessible while protecting them beneath the upper plate.

In this chapter I'll walk through the design decisions and the process behind developing the *Centauri* quadcopter body.

## Criteria
Designing a quadcopter airframe, as I quickly discovered, is challenging! The design has to satisfy *a lot* of competing criteria:

**5-Inch Quadcopter**: I wanted this quadcopter to be significantly smaller than *Scout*, which was very large. Specifically, I was targeting a **5-inch** body. In the quadcopter world, "5-inch" refers to the propeller diameter on each of the four motors; props are commonly measured by their diameter in inches, and quadcopters are usually "sized" the same way. So a 5-inch frame must be wide enough to fit 5-inch propellers, the maximum diameter it can support. A 5-inch frame is the "gold standard" in FPV racing and prints efficiently, but it's small, which leaves little room for onboard hardware!

**It must fit all hardware**: Once I settled on the 5-inch goal, I had to figure out how to *fit* all of the onboard hardware. There are a lot of components to embed! I list them below, but I'll cover each one and its role in the next chapter; trust me, that could be an entire chapter on its own!

**MCU programmable port must be accessible**: Whenever I update the flight controller firmware or pull telemetry off the MCU, I need to connect to it over USB. The Raspberry Pi Pico I'm using as the MCU has to be positioned where it's easy to plug into without taking the frame apart.

**Onboard Prong (GoPro) Mount**: Something I wished *Scout* had was the ability to capture onboard video! This quadcopter needed a "prong" mount so I could screw in my GoPro (or any compatible device) to record in-flight footage.

**IMU Close to Center of Mass**: As you may know, one of the things a flight controller does to achieve stable flight is continuously monitor the *actual* change in orientation (gyro rates) during flight. Because clean gyro readings are *absolutely critical* to stable flight, it's essential that the IMU sits as close to the quadcopter's center of mass as possible. An off-center accelerometer also senses acceleration caused by rotation around the center of mass. Gyroscope angular-rate readings do not inherently change with position on a rigid frame, but mounting vibration can still spoil the measurements.

**Antenna line-of-sight**: I'll expand on this in the next chapter on the hardware package, but there's a 433 MHz "rubber ducky" antenna onboard for bidirectional communication with the pilot (transmitter). Maintaining that link is *vital* in flight. Even a half-second delay could be catastrophic mid-maneuver. So optimal antenna positioning, with little to no obstruction, was a primary concern.

**Future Expansion**: I wanted to leave room for further experiments. What do I mean by that? Down the road, I may add a [TF Luna](https://en.benewake.com/TFLuna/index.html) LiDAR unit to the underbelly to enable altitude tracking and controlled landings. I didn't plan to include it in the first build of *Centauri*, but I wanted to design with it in mind so that adding it later wouldn't require a full redesign! That meant including mounting holes at the bottom for the LiDAR unit, plus the option to add a "stand" so the unit doesn't scrape the ground when the quadcopter is at rest.

**Simplicity**: As with any engineering design, the real measure of success is meeting *all* of the criteria in as efficient a package as possible. My goal was *not* to over-engineer the airframe, but to arrive at a simple, intuitive solution that achieves the goal with minimal complexity.

## Airframe Design

The two-level frame separates the electronics bay from the battery and camera mount. The [build guide](../quadcopter-build-guide/) shows how to print and assemble the parts.
In this section I'll document, in detail, the airframe design I developed to accommodate all of those criteria. I spent *a lot* of time in Blender mocking up the hardware components the drone would have to fit, designing a frame around them, and shifting their positions until I found the optimal layout!

Given my 5-inch goal (prop diameter) and my desire to keep the frame 3D-printer friendly (not huge!), my first decision was to space the motors exactly 200mm apart:

![measurements with props](https://i.imgur.com/vU6FyG2.png)

At 200 millimeters between motors, the 5-inch props (127mm) have plenty of clearance from each other and won't strike any onboard components.

To hold all of the planned hardware and electronics, I designed the airframe with two levels: a lower level ("level 1") and an upper level ("level 2"):

![levels](https://i.imgur.com/WXYOwv8.png)

The two levels are separated by 19.5 mm, a gap conveniently set by the height of the arms themselves. I sized this height to exactly match what an M3*30mm screw provides!

![M3*30mm](https://i.imgur.com/AhcyvLC.png)

The arms incorporate several design considerations:
- The 19mm x 16mm hole pattern at the end (where the motor mounts) perfectly matches the mounting screw positions of [the motors I used](https://amzn.to/4pgOY9G).
- The middle is hollowed out to save weight, but with a "bridge" across it for mounting the ESC.
- A 2mm "tunnel" through that bridge lets a small zip tie pass through and clamp the ESC firmly in place.
- Two M3 holes at the base of the arm let two M3*30mm screws pass through, holding the two levels together while the arm acts as a natural spacer between them.

![arm_design](https://i.imgur.com/MeEeymi.png)

The arm above is shared by all four positions, with only minor modifications on some versions to accommodate an antenna mast.

The lower level holds the electronics needed for flight: the carrier board with its Raspberry Pi Pico, the HC-12 radio module, the MPU-6050 IMU, and the MP1584EN 5V regulator.

![Lower electronics bay with the carrier board and external modules mounted](https://i.imgur.com/iEqxfzY.png)

The carrier board is secured to the lower plate with M2 screws. The Pico is soldered onto the board, with its USB port accessible from outside the frame for programming and downloading telemetry.

The MPU-6050 sits in a small printed frame near the center of the aircraft. Double-sided foam tape secures the sensor and helps isolate it from motor vibration. Its orientation matters; the build guide shows how to position it.

The HC-12 sits at the rear left, close to the antenna mast. Zip ties secure it to the lower plate, with its antenna connector facing rearward. This keeps the coaxial cable route short.

![HC-12 mounted at the rear left of the electronics bay](https://i.imgur.com/XfoyiiW.png)

The MP1584EN regulator is also secured with a zip tie. It supplies regulated 5V power for the electronics. Battery leads exit through the rear of the lower plate and are held down with zip ties, ending in an XT60 connector for the flight battery.

![Carrier board, radio, IMU, and regulator mounted in the lower bay](https://i.imgur.com/ynpOb9W.png)

The upper level holds three components:
- The battery, which takes up the vast majority of this level. As mentioned, I used a rather large 4S 3,300 mAh battery!
- A 3-prong GoPro mount at the very front of the drone. It can hold a GoPro, or really any device with a compatible 2-prong mount!
- The antenna mast at the rear of the drone (shown in red). While it isn't technically *on* the upper-level plate, antenna line of sight is very important, so I positioned the antenna at the very top of this mast, away from electronics that could interfere or obstruct it.

![level2_components](https://i.imgur.com/dEDRxz6.png)

## Unused Design Aspects
As mentioned earlier, the Centauri airframe includes several design elements that aren't used in the current iteration of *Centauri* but are available to leverage in the future.

One of those future ideas was mounting a LiDAR unit to the underbelly, letting the flight controller get an accurate altitude reading in close proximity to the ground. With a unit on the underbelly, though, I had to make sure the quadcopter could rest on something *other than* the LiDAR unit, which would damage it.

The simple solution was four M4 screw holes on the lower level.

![M4 holes for landing studs](https://i.imgur.com/WR7OsXn.png)

Four M4*30mm screws can thread through to act as "landing legs", keeping the LiDAR module off the ground. I would *not* recommend landing on these on cement, as they're rigid with no flexibility or "cushion." Instead, I gently set the quadcopter on them before takeoff and always do a soft landing on grass.

![M4 studsTF Luna on underbelly](https://i.imgur.com/RFNRN2m.png)

For mounting the LiDAR unit itself (a [TF Luna](https://amzn.to/4fk1hxM)), two small M2 holes at the center let the unit attach to the underbelly. If you scroll up, you'll see this M2 hole also penetrates the MPU-6050 frame!

![M2 holes for mounting TF Luna to underbelly](https://i.imgur.com/QZ11Doi.png)

## Four Configurations
The section above described the Centauri airframe in "Configuration D", its most advanced and capable form. There are actually *four* configurations, each only slightly different from the others.

![configurations](https://i.imgur.com/dd01Brh.png)

As seen above, the only thing that changes across the four configurations is the **antenna position**. I found the 433 MHz antenna's position significantly affects the quadcopter's range; each configuration achieves a different antenna position, and thus a different range:
- **Configuration A: Internal Spring Antenna = Least Range** - this configuration uses *no* externally mounted 433 MHz antenna at all! It relies on the [HC-12's standard spring antenna](https://www.google.com/search?udm=2&q=hc12+spring+antenna) soldered directly to the HC-12 and bent into a compromised position to fit the tight gap between levels 1 and 2. I **do not recommend** this configuration, as it severely limits range, but I'll grant that it's the quickest to get running, the simplest, the most durable, and perfectly fine for a first iteration just to validate that the quadcopter works.
- **Configuration B: Side-Mounted Antenna** - the first of the externally mounted 433 MHz antenna configurations. With a high-quality antenna mounted externally, range improves significantly. However, I found it less than ideal at distance: the quadcopter can turn into an orientation that puts the LiPo battery *directly* between the antenna and the pilot's transmitter, breaking the line of sight.
- **Configuration C: Rear-Mounted Antenna** - this moves the externally mounted antenna to the rear of the airframe, directly behind the battery. That solves most of the "LiPo blocking" problem from Configuration B, letting the antenna keep direct line of sight to the transmitter in many more orientations. However, during resonance testing with a NanoVNA, I found that positioning the antenna so close to a dense battery hurt its ability to receive reliably.
- **Configuration D: Mast-Mounted Antenna = Greatest Range** - the "final" configuration, with the externally mounted antenna perched atop a "mast" at the rear of the body. The mast puts space between the LiPo battery and the antenna, getting the antenna into free air. This configuration delivers the greatest range but it's also by far the most fragile. Any roll the quadcopter makes will almost certainly snap the mast and end your day of flying, so be careful! I've successfully flown at ~100 meters with no problems in this configuration.

I recommend the mast-mounted airframe and antenna parts linked in the shop and build guide. The range observations here describe my tests and are not guarantees for another aircraft or flight location.

If you're experienced or want to make sure your build goes the distance, I recommend **Configuration D**: it's more complex, but it's the best configuration for performance. You can also *start* with Configuration A and later move to **Configuration D** by printing the rear-left arm with the antenna mast and swapping it in.

**Configuration B** and **Configuration C** are comfortable middle grounds between A and D.

All parts required to assemble every configuration are available in the design [on Thingiverse](https://www.thingiverse.com/thing:7429193).

*If you'd like to quickly compare the "complete" designs in each configuration, you can download a fully assembled airframe for each one here: [Config A](https://github.com/TimHanewich/centauri/releases/download/67/centauri_config_A.stl), [Config B](https://github.com/TimHanewich/centauri/releases/download/67/centauri_config_B.stl), [Config C](https://github.com/TimHanewich/centauri/releases/download/67/centauri_config_C.stl), [Config D](https://github.com/TimHanewich/centauri/releases/download/67/centauri_config_D.stl).*

## Printing
With the design covered, let's talk about printing!

The airframe uses approximately **155 grams of PLA at 30% infill**. At $15 per kilogram, that is about **$2.33 in filament**, excluding waste and printing costs. Actual usage depends on your slicer settings.

Print one lower plate, one upper plate, four arms, the MPU-6050 frame, and the three antenna-mast components. Add the GoPro mount if you plan to mount a camera. The [shop's airframe list](../../shop/#quadcopter-parts) links the design files and mounting hardware.

Below are some photos I got while printing a few of the parts!

*Printing the lower level:*

![printing lower level](https://i.imgur.com/0L9z7Zc.jpeg)

*Printing the arms:*

![printing the arms 1](https://i.imgur.com/MnDo5US.jpeg)

![printing the arms 2](https://i.imgur.com/G4NlhgW.jpeg)

## Close
With the body designed and printed, the next chapter details the hardware package and electronics wiring mounted onboard: the sensors and components that make flight possible in the first place!

Click here to continue reading in this series: [Full-Stack Flight, Chapter 4: Quadcopter, Part 2: Hardware and Electronics Package](../chapter4).

*Ready to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*