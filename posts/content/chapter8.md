---
id: chapter8
title: 'Full-Stack Flight, Chapter 8: Unpacking Flight Telemetry for Analysis'
description: 'Turn raw flight logs into readable data you can graph, analyze, and overlay on video. Learn how to retrieve telemetry from your Pico and use it to understand flights and troubleshoot problems.'
---

# Full-Stack Flight, Chapter 8: Unpacking Flight Telemetry for Analysis
![banner](https://i.imgur.com/63Vq8ue.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](../chapter0).*

Over the previous chapters in this series about the *Centauri* quadcopter ecosystem, we learned how Centauri's quadcopter was designed, built, and programmed, and how the pilot's transmitter was built for bidirectional communication with the quadcopter. In this chapter, we'll look at the *after-flight* phase: analyzing telemetry data!

As discussed in [chapter 5](../chapter5), the *Centauri Flight Controller* logs telemetry data to its onboard flash storage several times per second. This data lives on the device and can easily be accessed later.

And as we discussed in [chapter 1](../chapter1), Centauri's 3D-printed airframe was designed so the USB port on the Raspberry Pi Pico (the microcontroller) is easily accessible:

![pico port](https://i.imgur.com/EaqFWzX.png)

Because the port is so accessible, it's very easy to plug a USB cable between your computer and the quadcopter after a flight and pull off the telemetry!

## Accessing the Telemetry
After plugging in your Raspberry Pi Pico (which has already been configured with MicroPython, flashed with the *Centauri Flight Controller Firmware*, and completed a successful flight), you can use [Thonny](https://thonny.org/) to access the files on the Pico's small flash memory, shown below:

![using thonny](https://i.imgur.com/B5EOT7c.png)

The top left of the window shows the directory on your PC you're currently in, and the bottom left shows the files on the Raspberry Pi Pico. Using Thonny, we can easily transfer a file from the Pico to our computer by right-clicking it and choosing "Download to ...".

![download](https://i.imgur.com/aGSSgtV.png)

After a few moments of transferring (depending on file size), you'll have the file saved and accessible on your computer!

## Telemetry Format
You'll notice the file the *Centauri Flight Controller* logs to its flash storage is simply named `log`. To conserve the Pico's limited onboard storage *and* keep the telemetry packing as compute-efficient as possible, the raw telemetry is saved in a **dense binary format**. This means it's raw bytes, *not* something you can easily open and read like a `.csv` file or an `.xlsx` spreadsheet!

This raw `log` file contains all the telemetry, but in a very information-dense format. While it isn't human-readable as-is, we have a way to unpack it *into* a human-readable format. And that's where the **analysis script** comes in!

## Unpacking the Telemetry
I wrote a lightweight script that handles **unpacking** the raw telemetry the quadcopter records into a human-readable format. You can find that script [here](https://github.com/TimHanewich/centauri/tree/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/analysis).

![unpacking](https://i.imgur.com/wsQo81w.png)

As you can see above, using the analysis script is quite simple!
1. Run `main.py` (Python script)
2. Pass the raw `log` file to it

It then unpacks all the individual telemetry frames present in that raw log file (the Centauri Flight Controller logs multiple telemetry frames per second).

Next, it performs some analysis over the telemetry frames in the `log` file. More specifically, it focuses on each individual "flight" recorded in the file. It infers a unique "flight" whenever the quadcopter went from **unarmed --> armed --> unarmed again**. That span of time when it was "armed" (motors spinning) is considered a unique flight.

At the very end of its output, the script prompts you for the path of a file to dump the raw telemetry into, in a *human-readable format*:

![saving to CSV](https://i.imgur.com/wEyuF0H.png)

After passing in the path to a brand-new (empty) CSV file, you can open it and see the telemetry data presented in a spreadsheet format!

![opened CSV](https://i.imgur.com/LkBRTpB.png)

And now we have that telemetry, unpacked, in a human-readable format!

*Note: below is the difference in storage size between the binary `log` file and the unpacked `log.csv` file, illustrating the efficiency gains of storing as binary. At 112 KB vs. 293 KB, the unpacked version is 162% bigger! The binary version has a footprint of only 38% of the unpacked version.*

![difference](https://i.imgur.com/WsvIVIr.png)

## Understanding the Telemetry
With the telemetry data unpacked into a human-readable format (a CSV file), let's take a closer look at the full data available:
- **Seconds**: the exact timestamp, in seconds, this telemetry frame was taken at. Note that this may *decrease* from a high timestamp to a low one if the quadcopter is rebooted (system time resets back to 0).
- **Battery Voltage**: raw battery supply voltage.
- **Pitch Rate**, **Roll Rate**, **Yaw Rate**: the *actual* angular velocity of the quadcopter's body.
- **Pitch Angle** and **Roll Angle**: the angle estimates, calculated by the flight controller's complementary filter. (*Note: as of this writing, I believe these to be only mildly accurate; I need to tweak the calculation.*)
- **G-Force**: how many G's the quadcopter is pulling at that moment.
- **Input Throttle**: the pilot's current throttle input, from 0 to 100, representing 0-100%.
- **Input Pitch**, **Input Roll**, **Input Yaw**: the pilot's current input on the three axes, ranging from -100 to 100, representing -100% to 100%.
- **M1 Throttle**, **M2 Throttle**, **M3 Throttle**, **M4 Throttle**: the flight controller's current output for each motor throttle, determined by the PID calculations.
- **Cmd Last Receved ms**: how long ago a *Control Packet* (see [chapter 2](../chapter2)) was last received, in milliseconds. Helps indicate Rx issues. Represented by 1 byte, so it maxes out at 2,550 ms.

## Using the Telemetry: Overlay & Dashboarding
With a heap of telemetry data from the flights *Centauri* took, there's a lot we can do with it, which is amazing!

The first use of the telemetry I want to highlight (and probably the flashiest 😊) is as a *telemetry overlay* on any onboard or ground-based video recordings of *Centauri* flying. [Dashware](https://dashware.software.informer.com/) is a discontinued, yet still widely used, PC app that lets you overlay telemetry data onto a video recording. I developed [Centauri telemetry-specific Dashware assets](https://github.com/TimHanewich/centauri/tree/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/dashware) that you can use to overlay your *Centauri* telemetry data directly onto a video with only a few clicks and timing syncs!

![example telemetry overlay gif](https://i.imgur.com/bUNN34B.gif)

The above is just a short clip from a much longer flight with *Centauri*. You can watch the full recording of that flight [here on YouTube](https://www.youtube.com/watch?v=evh0FCPapC8), embedded below:

https://www.youtube.com/watch?v=evh0FCPapC8

*While I do mention the step-by-step process for overlaying telemetry data onto a video [in this section on GitHub](https://github.com/TimHanewich/centauri/tree/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/dashware#steps-to-overlaying-telemetry-on-onboard-footage), I don't go into great detail. If it would be helpful for me to write a dedicated article on that, let me know! Reach out to me on the [Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg).*

Besides overlaying telemetry on top of a video, we can also plot this data in any dashboarding or reporting software like Power BI or Tableau. Or, in the modern era, you can prompt any AI coding agent to create a bespoke dashboard for you, like the one I made below in 5 minutes.

![dashboard](https://i.imgur.com/xuKC9Sh.gif)

*If you want to test this out for yourself, you can download the `dashboard.html` file [here](https://github.com/TimHanewich/centauri/releases/download/54577736/dashboard.html).*

## Analyzing the Telemetry: Troubleshooting!
As much as I love showing off the cool telemetry overlays and dashboards, any experienced engineer knows telemetry *also* helps diagnose the root cause of problems. It's not the fun, flashy side of things, but closely reviewing telemetry is sometimes the best way to start figuring out what went wrong!

The best example of a problem occurring and telemetry analysis leading me to a conclusion and later a fix was a flight *attempt* I made on February 13, 2026. This was meant to be the first flight of *Centauri* in "Configuration D" (see [chapter 3](../chapter3)) with the antenna mast.

As you can see below, it was *not* a successful flight!

![error side by side](https://i.imgur.com/QlyCvWp.gif)

And unfortunately the quadcopter broke in multiple places and needed repairs:

![broken](https://i.imgur.com/xobvz1Z.png)

As soon as I applied any throttle, the motors spooled up to an aggressive speed and the quadcopter uncontrollably smacked the roof, then fell and crashed. I was puzzled as to why! Fortunately, I had the onboard telemetry, and analyzing it helped me determine the root cause:

![telemetry analysis](https://i.imgur.com/hBq2l0E.png)

I'll spare you the lengthy details, but this kicked off a multi-week investigation into the root cause, [experimental tests to isolate the issue](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/flights/20260213%20Nokomis%20Community%20Park/tests.md), and the development of [some theories](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/flights/20260213%20Nokomis%20Community%20Park/humidity-short-theory.md), which ultimately led to a more secure, failsafe-heavy communication protocol between the transmitter and quadcopter.

Had I not had this telemetry to analyze, I would have been left with almost no breadcrumbs, making it particularly difficult to bounce back and make improvements!

## Try it yourself!
Fortunately, unlike the rest of the *Centauri* ecosystem, you can try converting and analyzing *Centauri* telemetry *right now* with nothing more than a computer that has Python installed.

Below are a few direct download links to raw `log` binary files:
- [February 13, 2026: Corrupt Packet Failure](https://github.com/TimHanewich/centauri/releases/download/45/log) (discussed in section above)
- [February 22, 2026: eight flights](https://github.com/TimHanewich/centauri/releases/download/48/log)
- [March 7, 2026: multiple multi-minute flights](https://github.com/TimHanewich/centauri/releases/download/57/log)

Download a `log` file above and pass it to [main.py](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/analysis/src/main.py) to unpack it, save it as a CSV file, and test your analysis skills!

## Close
And now we've covered the third and final part of the *Centauri* ecosystem: post-flight analysis scripts and tools for analyzing real flight telemetry. This is a powerful capability that gives you a strong understanding of how your own *Centauri* quadcopter is working and helps you diagnose challenges (plus, it looks cool as an overlay!).

In the next chapter, the final chapter of this series (at least for now), I'll share some closing thoughts about the *Centauri* project overall and how I recommend approaching building your own *Centauri* flight system!

Click here to continue reading in this series: [Full-Stack Flight, Chapter 9: Closing Thoughts](../chapter9).

*Ready to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*