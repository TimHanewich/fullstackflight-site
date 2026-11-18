---
id: chapter2
title: 'Full-Stack Flight, Chapter 2: Defining a Communication Protocol'
description: 'Learn how a drone and its transmitter exchange control commands, settings, and telemetry over radio. Explore the compact binary packets behind the Centauri communication protocol.'
---

# Full-Stack Flight, Chapter 2: Defining a Communication Protocol
![banner](https://i.imgur.com/DE0pEtw.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](https://medium.com/@timhanewich/full-stack-flight-building-a-quadcopter-ecosystem-from-scratch-18d43386bb6d). This article contains Amazon affiliate links. If you make a purchase through them, I may earn a small commission at no extra cost to you.*

As mentioned in [the previous article](https://medium.com/@timhanewich/full-stack-flight-chapter-1-the-centauri-ecosystem-eacfcecc90f5), *Centauri* is an entire quadcopter ecosystem. Since in this project I take on designing and building both the drone and the pilot's transmitter from the ground up, I am also responsible for designing how the two communicate with each other over radio. The communication protocol is an *extremely* important part of the Centauri ecosystem. 

![protocol](https://i.imgur.com/1L4IfVg.png)

There are 4 different classifications of information (data) that may be exchanged between the Transmitter and Drone:
1. **Control Packet** (*transmitter --> drone*): an update in the throttle, pitch, roll, and yaw input the pilot is applying. (high frequency during flight)
2. **Settings Update Packet** (*transmitter --> drone*): an update in the PID gains that the drone will use to stabilize while flying. This allows for "on the fly" updates without having to "hard-code" these into the flight controller code!
3. **Telemetry Packet** (*drone --> transmitter*): periodic packet the drone will broadcast out to update the transmitter (pilot) of its status: battery level, IMU data, etc. Broadcasted every 2 seconds while *not* armed.
4. **Special Packet** (*drone --> transmitter*): a free-form text message that drone can transmit out to convey a direct message back to the pilot. Can contain any message. Used for things like confirming calibration, relaying problems.

Designing a protocol to efficiently carry the data in each of these four exchanges was a big challenge! I'll explain more on the design and decisions for each below, starting with the most important: the **Control Packet**.

## The "Control Packet"
As mentioned above, the Control Packet is likely the most important packet of all. It is indeed where most of my time was spent optimizing efficiency, given its critical, high-bandwidth, low-latency requirement.

The primary role of this packet is rapid broadcasting of the pilot's current inputs across four inputs: *throttle*, *pitch*, *roll*, and *yaw*.  The transmitter will send these out at a high frequency (20 times per second); these packets will be received by the drone, unpacked, and used to update the PID equation which then calculates how to apply thrust across the four motors of the drone to accomplish the attitude change rates implied by the pilot.

Three challenges are presented in designing this packet that we must consider:
1. **It is a bandwidth-constrained environment**: discussed in further detail later in this series, both the transmitter and quadcopter will be using two low-powered, inexpensive, lightweight Tx/Rx radio modules, the [HC-12](https://amzn.to/4eWx48V). These are amazing devices but are not capable of high bandwidth comparable to the internet today.
2. **It must be efficient**: the data being communicated must be read and processed by the Raspberry Pi Pico serving as the microcontroller of the *Centauri* quadcopter while operating consistently at several hundred PID loops per second. Efficiency in unpacking this data is *extremely* important!
3. **It must transmit quickly**: the transmitter will *constantly* be sending updated control commands (updates of the pilot's current inputs) many times per second. In commercial scenarios, this is often 100+ times per second, but in Centauri we will shoot for ~20 times per second to keep it manageable. At 20 Hz, that means each packet must be transmittable in less than 0.05 seconds by the HC-12. This means the packet must be rather short, only emphasizing how its binary footprint must be efficient and high-density at packing the control commands.

The following depicts the binary design I developed to contain the required input data in an efficient package:

![control packet](https://i.imgur.com/jnvSrOE.png)

As seen above, **eleven** bytes are used, each byte serving as either A) packet metadata (identifier), B) control data, or C) a checksum:

- **Byte 1** = Metadata byte, a packet header. This identifies the packet as a control packet to the drone which then proceeds to unpack it as so.
- **Byte 2 and Byte 3**: the throttle input, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 4 and Byte 5**: the pitch input, encoded as a `int16` (-32,768 to 32,767) in big-endian format.
- **Byte 6 and Byte 7**: the roll input, encoded as a `int16` (-32,768 to 32,767) in big-endian format.
- **Byte 8 and Byte 9**: the yaw input, encoded as a `int16` (-32,768 to 32,767) in big-endian format.
- **Byte 10 and Byte 11**: both used as unique checksums.

The design above allows for several things:
- A `uint16` being used to express 0 to 100% for *throttle* allows for fidelity of 0.003%
- A `int16` being used to express -100% to 100% for *pitch*, *roll*, and *yaw* allows for fidelity of 0.003%
- A 16-bit checksum only allows a 0.0015% chance of a random control packet pass (low risk of unintended data)

What is *not* included in the graphic above but *is* included in the transmitted packet is the `\r\n` terminator at the very end of the packet (`0x0D` followed by `0x0A`) to delineate between packets that were sent. So altogether, 13 bytes (11 in the packet and 2 as terminator) will be transmitted 20 times per second, a rate of **260 bytes/second**.

## The "Settings Packet"
As I mentioned previously in the opening chapter of this series, one of the serious challenges I had with my previous flight controller, *Scout*, was updating PID gains while PID tuning. In *Scout*, the PID gains were "hard-coded" into the flight controller code, meaning the process of PID tuning involved me updating the code and re-flashing it to the flight controller every time I wanted to experiment with a minor PID adjustment. 

![GIF of oscilations](https://i.imgur.com/ecQJZ33.gif)

*PID tuning is arguably one of the most important aspects of a flight controller - and it isn't easy!*

Unlike *Scout*, *Centauri* would have an onboard radio communication module (the HC-12) that allowed me to theoretically exchange *any* information between the transmitter and quadcopter, so long as I wrote the code that would package it up, send it, receive it, and then unpackage it. With this capability I wanted to add a very important feature to *Centauri*: the ability to flash **new** flight settings (PID gains) on the fly. 

During development of *Centauri*, this would enable me to enter in any PID gains I'd like on the transmitter side and then send them over to the quadcopter to then be updated live, obviously while unarmed (not flying). Thus, the **Settings Packet** was created to allow for the exchange of this flight settings data:

![settings_packet](https://i.imgur.com/7gpTt6y.png)

As seen above, the settings packet is 22 bytes:
- **Byte 1**: Metadata byte, a packet header. This identifies the packet as a settings packet to the drone which then proceeds to unpack it as so.
- **Byte 2 and Byte 3**: Pitch Kp, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 4 and Byte 5**: Pitch Ki, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 6 and Byte 7**: Pitch Kd, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 8 and Byte 9**: Roll Kp, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 10 and Byte 11**: Roll Ki, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 12 and Byte 13**: Roll Kd, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 14 and Byte 15**: Yaw Kp, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 16 and Byte 17**: Yaw Ki, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 18 and Byte 19**: Yaw Kd, encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 20 and Byte 21**: I-Term Limit (safety to prevent uncontrolled spooling), encoded as a `uint16` (0 to 65,535) in big-endian format.
- **Byte 22**: unique checksum.

The *Centauri Transmitter* has the ability to **pack** these settings update values into a 22-byte settings packet via the `pack_settings_update` function in its `tools.py` module, shown [here](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/tools.py#L52). You can see this function used live in the transmitter code on [line 378 of `main.py`](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/main.py#L378).

The *Centauri Flight Controller* (on the quadcopter) has the ability to **unpack** this 22-byte settings packet into a `dict` via the `unpack_settings_update` function in its own `tools.py` module, shown [here](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/quadcopter/src/tools.py#L45). You can see this function used live in the flight controller code on [line 443 of `main.py`](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/quadcopter/src/main.py#L443).

Note that after the *Centauri Flight Controller* receives the settings update, unpacks it, and updates the settings values internally, it sends out a `SETUPOK` message (special packet) to confirm to the transmitter it was successful in receiving and implementing the updated settings values.

## The "Telemetry Packet"
In addition to the inability to send PID gain updates over-the-air, another critical issue with *Scout*, my previous quadcopter flight controller, was the inability to get telemetry back from the quadcopter to the transmitter, visible to the pilot. Now with the two onboard transceiver radio modules, I could send anything back and forth... and this meant I could also send telemetry updates from the drone to the transmitter, visible to the pilot!

Enter the "Telemetry Packet": a packet for sending high-level telemetry data to the pilot to update them on its status. There is a lot of data that could be sent over, but the only *very* important data point that I *really* wish I had on Scout is the **battery voltage**. Knowing the battery voltage without the need to unplug power from the drone and check with a multi-meter would allow for much safer, low-risk flying as I no longer would be only guessing how much battery I have left based on flight time.

Before proceeding, I want to explain that the telemetry packet actually has a dual purpose. There are two uses of telemetry in the *Centauri* ecosystem:
- **Use #1 = recording**: for recording to storage on the quadcopter for later analysis.
- **Use #2 = transmitting**: sending the live telemetry to the transmitter for it to be shown to the pilot. At a much lower rate than in use case #1.

Due to Tx/Rx constraints and to keep communication fast and lightweight, only a *subset* of all the telemetry collected and recorded will be sent to the transmitter. In other words, *all* of the telemetry collected will be **recorded** to onboard storage while only a select few data points will be **transmitted** back to the transmitter.

### The "Recorded" Telemetry Packet
![telemetry_packet_recorded](https://i.imgur.com/sucA5GV.png)

As seen above, the "recorded" version of the telemetry packet is 19 bytes in length; with the traditional `\r\n` terminator appended to the end, that is a total frame length of 21 bytes.

The recorded version of the telemetry packet consists of the following structure:
- **Byte 1, Byte 2, and Byte 3**: the timestamp at which this telemetry was captured, encoded as a 24-bit unsigned integer (3 bytes).
- **Byte 4**: Battery Voltage, from 6.0 volts to 16.8 volts, expressed without the decimal point (e.g. 140 would be 14.0 volts, 152 would be 15.2 volts, 90 would be 9.0 volts).
- **Byte 5**: the rate of pitch change, in degrees per second, expressed as an `int8`.
- **Byte 6**: the rate of roll change, in degrees per second, expressed as an `int8`.
- **Byte 7**: the rate of yaw change, in degrees per second, expressed as an `int8`.
- **Byte 8**: the pitch angle, in degrees, expressed as an `int8`.
- **Byte 9**: the roll angle, in degrees, expressed as an `int8`.
- **Byte 10**: the current G-load (G-force), expressed without the decimal point (e.g. 12 would be 1.2 G's).
- **Byte 11**: the throttle input from the pilot, expressed literally (0-100).
- **Byte 12**: the pitch input, expressed as an `int8` (-100 to 100).
- **Byte 13**: the roll input, expressed as an `int8` (-100 to 100).
- **Byte 14**: the yaw input, expressed as an `int8` (-100 to 100).
- **Byte 15**: Motor 1 Throttle, expressed literally as a percentage (0 to 100).
- **Byte 16**: Motor 2 Throttle, expressed literally as a percentage (0 to 100).
- **Byte 17**: Motor 3 Throttle, expressed literally as a percentage (0 to 100).
- **Byte 18**: Motor 4 Throttle, expressed literally as a percentage (0 to 100).
- **Byte 19**: Last Received, in ms. The time elapsed since a Control Packet was last received (for tracking continuity). Expressed as 10x the actual ms time, e.g. "5" would be "50 ms", "12" would be "120 ms", allowing for a maximum duration of 2,550 ms to be expressed.

Note that unlike other packets, there is *not* a checksum for the "Recorded" version of the telemetry packet; this is because this packet is only recorded directly to the flash storage onboard the microcontroller, *not* transmitted over-air where it is more susceptible to errors and bad data.

By recording the live telemetry periodically and storing to flash storage, this allows the user of *Centauri* to later download the telemetry, unpack it, and analyze it, or overlay it against a live in-flight video:

![overlay_example](https://i.imgur.com/aHxXC7U.gif)

### The "Transmitted" (Sent) Telemetry Packet
The 19-byte full telemetry packet described as the "Recorded" packet in the section above captures all of the relevant telemetry and records that to the onboard flash storage (low latency). As described earlier, a subsection of this telemetry is also periodically *transmitted* from the quadcopter to the transmitter (pilot) over radio communication.

Specifically, the following data points are delivered: **Battery Voltage**, **Pitch/Roll/Yaw Rates** (degrees per second), and **Pitch/Roll Angles**. I selected these fields as the bare minimum that would allow the pilot to A) check battery voltage before flying and B) validate the IMU is working as expected, two items that are critical to flying safely!

![telemetry_packet_transmitted](https://i.imgur.com/m9SoIgb.png)

If you look closely, you can tell that **Bytes 2-7 are direct transpositions of Bytes 4-9 from the "Recorded" version of the Telemetry Packet**. In Chapter 4, when we look closely at how the Flight Controller works, you'll see this design choice was chosen specifically for its efficiency over the need to "repack" *another* packet version.

Also, note: despite this being a *transmitted* packet (over the air via radio communications), this also does NOT have a checksum. Why? The information transmitted is not highly sensitive to the point where bad data would cause a catastrophic problem. If a periodic packet is received with bogus data, it will likely be very apparent to the pilot reading it and then quickly be replaced with an updated packet that contains the valid, correct data. 


### Telemetry Packet Example
The following example depicts how the *Centauri Flight Controller* uses the `pack_telemetry` function (found [in tools.py](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/quadcopter/src/tools.py#L87)) to pack a telemetry packet into a binary structure:

```python

from tools import pack_telemetry

# Values sent in telemetry packet
ticks = 5345             # example system ticks, in ms
vbat = 125               # battery voltage, 60-168, representing 6.0 volts to 16.8 volts
pitch_rate = 3           # pitch change rate, in degrees per second (literal)
roll_rate = -1           # roll change rate, in degrees per second (literal)
yaw_rate = 0             # yaw change rate, in degrees per second (literal)
pitch_angle = 2          # pitch angle, in degrees (literal)
roll_angle = -2          # roll angle, in degrees (literal)

# Values recorded to onboard telemetry, but not sent to transmitter
gforce = 12              # the current g-force level, expresed as 0 to 255 (0 = 0.0, 10 would be 1.0, 14 would be 1.4, etc)
input_throttle = 55      # throttle input, 0 to 100, expressed as a literal percentage
input_pitch = -13        # pitch input, -100 to 100, expressed as a literal percentage
input_roll = 3           # roll input, -100 to 100, expressed as a literal percentage
input_yaw = 0            # yaw input, -100 to 100, expressed as a literal percentage
m1_throttle = 65         # M1 (front left) motor throttle, expressed as a literal percentage (0 to 100)
m2_throttle = 63         # M1 (front left) motor throttle, expressed as a literal percentage (0 to 100)
m3_throttle = 42         # M1 (front left) motor throttle, expressed as a literal percentage (0 to 100)
m4_throttle = 37         # M1 (front left) motor throttle, expressed as a literal percentage (0 to 100)
lrecv_ago_ms = 62        # how many milliseconds ago a control packet was last received from the transmitter (for tracking Rx continuity)

# pack into a bytearray
to_pack_into = bytearray(19)
pack_telemetry(ticks, vbat, pitch_rate, roll_rate, yaw_rate, pitch_angle, roll_angle, gforce, input_throttle, input_pitch, input_roll, input_yaw, m1_throttle, m2_throttle, m3_throttle, m4_throttle, lrecv_ago_ms, to_pack_into)

# print the example
# All of this will be saved to onboard telemetry
print(str(to_pack_into)) # bytearray(b'\x00\x14\xe1}\x83\x7f\x80\x82~\x0c7WgdA?*%\x06')

# only the vbat, rates, and angles are sent via to transmitter
telemetry_packet = bytearray(7)
telemetry_packet[0] = 0b00000000           # header byte. Bit 0 = 0 means it is a status packet.
telemetry_packet[1] = to_pack_into[3]      # vbat
telemetry_packet[2] = to_pack_into[4]      # pitch rate
telemetry_packet[3] = to_pack_into[5]      # roll rate
telemetry_packet[4] = to_pack_into[6]      # yaw rate
telemetry_packet[5] = to_pack_into[7]      # pitch angle
telemetry_packet[6] = to_pack_into[8]      # roll angle

print(str(telemetry_packet))               # bytearray(b'\x00}\x83\x7f\x80\x82~')

for b in to_pack_into:
    print(str(b))

```

## The "Special Packet"
The final packet type is the "Special Packet". This packet allows for the transmission of otherwise unstructured data, usually expressed in very short text-based messages (only a few characters). While designing *Centauri*, I wanted the ability for the drone to transmit miscellaneous messages to the pilot about various things from successful bootup or calibrations, to errors it encountered. 

![special_packet](https://i.imgur.com/s9TDmGz.png)

As seen above, the special packet has a very simple structure. The first byte is always `0b00000001` (equivalent to `1`), with bit 0 set to 1 to identify it as a Special Packet. The following 50 bytes each contain the decimal equivalent of each character of a message. This allows for small messages like "SETUPOK", for example, to be sent. Finally, the `\r\n` terminator is appended at the end to mark the end of the packet.

At a maximum number of characters of 50, that means the maximum length of a Special Packet is 51, or 53 if you are counting the `\r\n` that is also transmitted. Note that not all packets will be of this length. If a message is only a few characters, only a few bytes will be used to represent those characters in the Unstructured Message section.

Because of its simplicity, packing a Special Packet and sending it to the transmitter via HC-12 is handled via a function drafted directly within the flight controller's `main.py`, shown [here](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/quadcopter/src/main.py#L149).

## Close
And with that, we've covered all four packet types that make up the *Centauri* communication protocol: the Control Packet, Settings Update Packet, Telemetry Packet, and Special Packet. Together, these four packets form the entire "language" the transmitter and drone use to talk to each other. Designing this communication to be efficient, low-latency, and reliable was a challenging but very important engineering aspect of this project.

With the protocol now defined, we can move on to actually building the physical hardware that will use it! In the next chapter, we'll dive into the design of the *Centauri* quadcopter itself, starting with its 3D-printed airframe.

Click here to continue reading in this series: [Full-Stack Flight, Chapter 3: Quadcopter, Part 1: Designing a 3D-Printed Airframe](https://medium.com/@timhanewich/full-stack-flight-chapter-3-quadcopter-part-1-designing-a-3d-printed-airframe-9d4f9021a68c).

*Ready to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*