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