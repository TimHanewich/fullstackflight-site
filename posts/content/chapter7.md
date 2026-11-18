---
id: chapter7
title: 'Full-Stack Flight, Chapter 7: Transmitter, Part 2: The Pilot''s Control Interface'
description: 'See how Python turns a laptop and Xbox controller into a drone transmitter. Explore controller input, radio communication, live telemetry displays, and wireless PID settings updates.'
---

# Full-Stack Flight, Chapter 7: Transmitter, Part 2: The Pilot's Control Interface
![banner](https://i.imgur.com/AAwQJPK.jpeg)

*This article is part of a 10-part series on how the [Centauri Quadcopter](https://github.com/TimHanewich/centauri) was created. For a list of all other articles, please visit the introductory article found [here](../chapter0).*

![transmitter](https://i.imgur.com/MEK0Utk.jpeg)

In the last chapter, we explored the role the *Transmitter* plays in the flight ecosystem. As we learned, the *Transmitter* is the critical device the pilot uses to both control the quadcopter's flight and, potentially, view telemetry or other data the quadcopter sends back.

![pic of 3-part transmitter system](https://i.imgur.com/ysyQIHS.png)

The *Centauri* Transmitter is really a **3-part** system, acting together as one:
- **Transceiver Platform**: covered in depth in the last chapter, this grants the PC the ability to communicate over the 433 MHz spectrum.
- **PC**: a computer that runs the Transmitter program, acting as "the brain" of the transmitter.
- **Xbox Controller**: an external gamepad, the control interface the pilot manipulates.

We covered the Transceiver Platform in depth in [the previous chapter](../chapter6). In this chapter, we'll focus on **the PC** and **the Xbox Controller**.

## Why a PC + Xbox Controller?
I described this in [the previous chapter](../chapter6) but will briefly explain it again here. Consider two capabilities any decent transmitter should provide to the pilot:
- A sleek, ergonomic, reliable controller they can manipulate to fly the quadcopter.
- A display screen that shows important input and telemetry data.

I considered designing, printing, assembling, and building a custom transmitter with rudimentary analog controls and a small display screen. However, I decided against it, reasoning that *leveraging an off-the-shelf PC and Xbox controller*, which already provide these capabilities so well, would be more efficient. Fortunately, that hunch paid off!

So you can think of the Centauri Transmitter as a program that runs on a laptop, leveraging attached, specialized hardware that makes the transmitter's entire operation possible!

## How the Transmitter Operates
The transmitter program itself is written in **Python**, with an assortment of SDK dependencies I'll describe later in this chapter. There are **four** critical coroutines that run within the transmitter program, side by side, continuously and indefinitely:

![four coroutines](https://i.imgur.com/hke2gUM.png)

- **Read Controller Inputs**: read the inputs on the Xbox controller to understand how the pilot wants to change the quadcopter's flight characteristics.
- **Transmit Control Data**: send updated control packets to the drone, telling it to adjust its flight to the pilot's wishes.
- **Receive Telemetry**: listen for and unpack telemetry the drone sends back with important status information.
- **Update Display**: update the laptop's screen, showing the most up-to-date information the pilot needs.

A [coroutine](https://docs.python.org/3/library/asyncio-task.html) is essentially a Python function that executes continuously, concurrently with other coroutines. Unlike **threading**, which also achieves concurrency, coroutines orchestrated by Python's `asyncio` module use only a single core to cooperatively multitask between the four coroutines, tending to whichever needs attention.

Each of these is a mini-discipline in its own right, so I'll dive deeper into all four in the sections below!

*If you'd like to read the complete source code for the Transmitter, check it out [here](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/main.py) on GitHub, fully open source!*

## Coroutine: Read Controller Inputs
Reading the pilot's inputs on the Xbox controller is absolutely critical to flying any drone! Particularly in FPV quadcopter flight, the pilot updates their inputs continuously, often making very small adjustments, and these small adjustments are vital to keeping the quadcopter in the air!

As mentioned previously, an off-the-shelf Xbox controller is a great device: we can plug it into the PC via USB and it's plug and play! But once it's plugged in, how do we read its inputs?

Enter **pygame**, a staple in the Python community for years now. [Pygame](https://pypi.org/project/pygame/) is a free, open-source, cross-platform library most commonly used for lightweight game development, but which *also* natively supports reading Human Input Devices (HIDs) like the Xbox controller.

With pygame, we can easily identify the attached controller during setup:

```python
# Initialize pygame and joystick module
console.print("[u]Controller Setup[/u]")
print("Initializing pygame for controller reads...")
pygame.init()
pygame.joystick.init()

# count how many controllers (joysticks) are connected
num_joysticks = pygame.joystick.get_count()
print("Number of connected controllers: " + str(num_joysticks))
if controller_required and num_joysticks == 0:
    print("No controllers connected! You must connect one before proceeding.")
    exit()

# loop through each controller
for i in range(num_joysticks):
    tjs = pygame.joystick.Joystick(i)
    tjs.init()
    print("Joystick " + str(i) + ": " + tjs.get_name())

# select the controller that will be used
controller = None
if num_joysticks > 0:
    controller = pygame.joystick.Joystick(0)
    controller.init()
    print("Controller #0, '" + controller.get_name() + "' will be used.")
```

As you can see above, setup is quite easy. And the continuous coroutine that reads new Xbox controller inputs is shown below:

```python
# set up continous Xbox controller read function
async def continuous_read_xbox() -> None:

    # declare non-local variables from main we will be accessing
    nonlocal armed
    nonlocal mode
    nonlocal throttle
    nonlocal pitch
    nonlocal roll
    nonlocal yaw

    # Establish nonlinear transformers for each input axis
    nlt_pitch:tools.NonlinearTransformer = tools.NonlinearTransformer(2.0, 0.05)
    nlt_roll:tools.NonlinearTransformer = tools.NonlinearTransformer(2.0, 0.05)
    nlt_yaw:tools.NonlinearTransformer = tools.NonlinearTransformer(2.0, 0.10) # my deadzone is higher than the others because I have a broken right stick on my controller that often rests at around 8% in either direction

    # determine what the yaw axis ID is (right stick X, horizontal, axis)
    right_stick_x_axis_id:int = 2 # default to windows
    if sys.platform.startswith("linux"): # if we are on linux
        right_stick_x_axis_id = 3 # set to3
    
    # infinite loop of reading
    while True:

        # handle changes in input state on the Xbox controller
        try:
            for event in pygame.event.get():
                if event.type == pygame.JOYAXISMOTION:
                    if event.axis == 5: # right trigger
                        throttle = (event.value + 1) / 2   # gets it to between 0.0 and 1.0
                    elif event.axis == 0: # left stick X axis (left/right)
                        roll = nlt_roll.transform(event.value)
                    elif event.axis == 1: # left stick Y axis (up/down)
                        # pushing the left stick forward will result in a NEGATIVE value. While this may seem incorrect at first, it is actually correct... pushing the left stick forward should prompt the quadcopter to pitch down (forward), hence it should be negative!
                        pitch = nlt_pitch.transform(event.value)
                    elif event.axis == right_stick_x_axis_id: # right stick X axis (left/right)
                        yaw = nlt_yaw.transform(event.value)
                    else:
                        #print("Axis '" + str(event.axis) + "': " + str(event.value))
                        pass
                elif event.type == pygame.JOYBUTTONDOWN:
                    if event.button == 0: # A
                        armed = True
                    elif event.button == 1: # B
                        armed = False
                    elif event.button == 4: # LB
                        mode = False # rate mode
                    elif event.button == 5: # RB
                        mode = True # angle mode
                    else:
                        #print("Button pressed: " + str(event.button))
                        pass
        except: # if it fails for some reason (i.e. glitch or xbox controller unplugged?), unarm!
            armed = False
            throttle = 0.0
            pitch = 0.0
            roll = 0.0
            yaw = 0.0
        
        # wait a moment
        await asyncio.sleep(0.05)
```

And that's it! That's the entire portion of the code that *reads input* from the USB-attached Xbox controller. I'll explain a few things in a bit more detail:

First, the `NonlinearTransformer`. This borrows from a concept I developed while building [*Scout*](https://github.com/TimHanewich/scout), my previous quadcopter flight controller, but never actually used. One problem I hit early in testing *Centauri*, after it became air-worthy, was how a *minor* input on the sticks would produce a relatively large reaction from the quadcopter, making it feel "twitchy". To combat this, the Transmitter implements a **NonlinearTransformer**.

![nonlinear transformer](https://i.imgur.com/kvxK6v4.png)

This is just a basic mathematical model that uses trigonometry to transform an input into a "dampened" version of itself, while still preserving the full range of input at the extremities. As you can see in the code snippet above, all three orientation inputs (pitch, roll, yaw) pass through a `NonlinearTransformer` that dampens the raw inputs. You may also notice the `NonlinearTransformer` implements a minor deadzone, preventing extremely small non-zero positions from being interpreted as valid input.

You'll also see that four buttons on the controller are monitored for being pressed: **A**, **B**, **LB**, and **RB**:
- **A**: "arms" the drone, moving the transmitter into a mode where it broadcasts non-zero throttle control packets. This basically enters flight mode!
- **B**: "disarms" the drone, shifting the transmitter to *only* broadcast zero-throttle packets, telling the quadcopter to stop spinning its motors.
- **LB** and **RB**: switch between "rate mode" and "angle mode", covered in chapter 5. *Note: while this mode-switch capability exists, it isn't implemented. As of this writing, the Centauri Flight Controller doesn't yet support angle mode.*

And that's how the `continuous_read_xbox()` coroutine works! Think of it as an ongoing bit of code that constantly reads the inputs on the Xbox controller, translates the raw values, and updates internal variables that other coroutines then use.

## Coroutine: Transmit Control Data
With control inputs collected from the Xbox controller, we now focus on the next routine: **transmitting these inputs to the quadcopter via Control Packets**. Remember the **Control Packet** we discussed in [chapter 2](../chapter2)? The role of this coroutine is to take the pilot's raw inputs on the Xbox controller and encode them into a **Control Packet** that is sent out continuously at a high frequency.

```python
# set up continuous radio sending
async def continuous_radio_tx() -> None:

    # declare variables from main we will be updating
    nonlocal packets_sent

    while True:
        if armed:
            throttle_to_send:float = idle_throttle + ((max_throttle - idle_throttle) * throttle) # scale within range, if armed
            ToSend:bytes = tools.pack_control_packet(throttle_to_send, pitch, roll, yaw) # pack into bytes
            if ser != None:
                ser.write(ToSend + "\r\n".encode()) # send it via HC-12 by sending it to the transceiver over the serial line
                packets_sent = packets_sent + 1
            await asyncio.sleep(0.05) # 20 Hz
        else:
            ToSend:bytes = tools.pack_control_packet(0.0, 0.0, 0.0, 0.0) # pack all 0 inputs
            if ser != None:
                ser.write(ToSend + "\r\n".encode()) # send it via HC-12 by sending it to the transceiver over the serial line
                packets_sent = packets_sent + 1
            await asyncio.sleep(0.5) # 2 Hz
```

As you can see above, `continuous_radio_tx()`, responsible for transmitting control data out to the quadcopter, is actually fairly simple. It handles the "armed" and "disarmed" situations separately:

If armed, it first scales the raw throttle (0-100%) linearly between `idle_throttle` and `max_throttle`, two onboard transmitter settings. Think of `idle_throttle` as the motor throttle when the quadcopter is *armed* but no throttle input has been applied yet (sitting on the ground, motors spinning, ready to take off). `max_throttle` is the maximum throttle the transmitter will ever send, even if the pilot applies 100% throttle on the controller. Both are configurable in the settings; more on that later.

It then packs all four control inputs (throttle, pitch, roll, yaw) into a `bytes` object, which is the Control Packet! Finally, it transmits this Control Packet to the quadcopter by sending it over the serial line (USB) to the Transceiver Platform, which broadcasts it out (read more about the Transceiver Platform in [chapter 6](../chapter6)).

If disarmed, the transmitter instead ignores all raw inputs on the Xbox controller, encodes a "zero-input" Control Packet in which all controls are at 0%, and broadcasts that out, essentially telling the quadcopter to "shut down all your motors and do nothing".

You'll also see that *during flight* (when armed), this coroutine continuously broadcasts 20 Control Packets per second (20 Hz), reducing that to just 2 per second (2 Hz) when transmitting disarmed packets. The higher rate is necessary for accurate flight, while the lower rate when disarmed gives the HC-12 on the Transceiver Platform more "available time" to *hear* the telemetry the quadcopter broadcasts while unarmed.

And speaking of receiving telemetry from the quadcopter, that brings us to our next section!

## Coroutine: Receive Telemetry
As we discussed in [Chapter 2 about the Centauri Communication Protocol](../chapter2), *Centauri* supports **bidirectional** communication between the pilot and the quadcopter. While unarmed (not in flight), the quadcopter continuously broadcasts **Telemetry Packets** containing status updates for the pilot.

In this coroutine, the Transmitter program checks for and receives those Telemetry Packets, unpacks them, and updates the internal variables that track the most recent quadcopter status data.

```python
# set up continuous radio rx (through tranceiver)
async def continuous_radio_rx() -> None:
    """Handles all received data from the transceiver via the USB (the transceiver passes along data it receives via the HC-12)"""

    # declare nonlocal variables we will be modifying
    nonlocal packets_received
    nonlocal packets_last_received_at
    nonlocal vbat # drone's battery level
    nonlocal pitch_rate
    nonlocal roll_rate
    nonlocal yaw_rate
    nonlocal pitch_angle
    nonlocal roll_angle

    # declare rxBuffer of all data received from transceiver through the USB serial line
    rxBuffer:bytearray = bytearray()

    # continuously monitor and receive new data from the serial port (from transceiver)
    while True:

        # read data if any is available!
        if ser != None:
            if ser.in_waiting > 0: # if we have data available
                data:bytes = ser.read(ser.in_waiting) # read the available data
                rxBuffer.extend(data)
            
        # handle data if we have any full lines in there
        while "\r\n".encode() in rxBuffer:

            # get the line
            loc:int = rxBuffer.find("\r\n".encode())
            ThisLine:bytes = rxBuffer[0:loc+2] # include the \r\n at the end (why we +2)
            rxBuffer = rxBuffer[loc+2:] # remove the line

            # increment packets received and mark the receiving timestamp
            packets_received = packets_received + 1
            packets_last_received_at = time.time()

            # Handle the line based on what it is
            if ThisLine[0] & 0b00000001 == 0: # if bit 0 is 0, it is a telemetry packet
                TelemetryData:dict = tools.unpack_telemetry(ThisLine)
                if TelemetryData != None: # it returns None if there was an issue like it wasn't long enough
                    vbat = TelemetryData["vbat"]
                    pitch_rate = TelemetryData["pitch_rate"]
                    roll_rate = TelemetryData["roll_rate"]
                    yaw_rate = TelemetryData["yaw_rate"]
                    pitch_angle = TelemetryData["pitch_angle"]
                    roll_angle = TelemetryData["roll_angle"]
            elif ThisLine[0] & 0b00000001 > 0: # if bit 0 is 1, it is a special packet (text)
                msg:str = tools.unpack_special_packet(ThisLine)
                drone_messages.append(display.Message(msg, time.time()))
            else:
                # handle uknown packet type?
                pass
            
        # sleep
        await asyncio.sleep(0.05)
```

In the above code, `ser` is a `Serial` object from [the pyserial](https://pythonhosted.org/pyserial/) package.

Observe that, at a rate of 20 times per second:
- Any newly received data is checked for.
- If newly received data is available, it's collected.
- Collected data is broken out into "lines" (discrete packets).
- Each line is interpreted by type and then unpacked.
- The unpacked data is used to update internal tracking variables.

The most interesting piece of that code is probably the use of `tools.unpack_telemetry()`. [The `unpack_telemetry` function](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/tools.py#L100) is a lightweight tool that translates the encoded **Telemetry Packet** (just a raw `bytes` object) into its discrete data points. You pass in the `bytes` object and get back a `dict` with the data points!

As you can see in the code above, various variables (`vbat`, `pitch_rate`, `roll_angle`, `drone_messages`, etc.) are updated; these variables will later be displayed to the pilot, which is a great segue to our next and final coroutine!

## Coroutine: Update Display
We now focus on the final coroutine: *displaying* all of this data for the pilot to see! This is a critical capability, as the pilot needs to see their own control input to confirm everything is working as expected, and also monitor the quadcopter's status to confirm it's still fit to fly.

![normal operations gif](https://i.imgur.com/fCYhbGL.gif)

The Transmitter program itself does *not* use a full GUI (graphical user interface); it uses the terminal directly. I'm using [rich](https://github.com/textualize/rich), a popular Python library that lets you build beautiful formatting directly in the terminal, to display the pilot's dashboard.

I developed [`display.py`](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/display.py) as a modular capability that uses `rich` to display all the data in the terminal, in a format I like. You pass a `DisplayPack` object into the `construct()` function, and the function builds a structure that's displayed in the terminal.

![display](https://i.imgur.com/TciVzxN.png)

*Above: the pilot's control interface*

The following is the display-updating coroutine, which uses the `display.py` module I wrote:

```python
# set up continuous display function
async def continuous_display() -> None:

    # display with live
    with rich.live.Live(refresh_per_second=60, screen=True) as l: # the refresh_per_second sets the upper limit for refresh rate
        while True:

            # prepare to print with display packet
            dp:display.DisplayPack = display.DisplayPack()

            # plug in basic telemetry info
            dp.uptime_seconds = time.time() - booted    # uptime of the system, in seconds (current time minus the booted timestamp)
            dp.packets_sent = packets_sent
            dp.packets_received = packets_received
            if packets_last_received_at != None:
                dp.packet_last_received_ago_ms = int((time.time() - packets_last_received_at) * 1000)
            else:
                dp.packet_last_received_ago_ms = None

            # plug in control variables
            dp.armed = armed
            dp.mode = mode
            dp.throttle = throttle
            dp.pitch = pitch
            dp.roll = roll
            dp.yaw = yaw                

            # plug in drone telemetry variables
            dp.drone_battery = vbat
            dp.pitch_rate = pitch_rate
            dp.roll_rate = roll_rate
            dp.yaw_rate = yaw_rate
            dp.pitch_angle = pitch_angle
            dp.roll_angle = roll_angle

            # plug in drone messages
            dp.messages = drone_messages
            
            # get to display
            td = display.construct(dp)

            # update live
            l.update(td)

            # wait
            await asyncio.sleep(0.01)
```

As you can see above, the `continuous_display()` coroutine is actually quite simple! It continuously packs all the internal status variables (kept up to date by the three other coroutines) into a new `DisplayPack` object, which is passed into the `construct()` function of my `display.py` module and turned into a `rich.console.Group` object. This `rich.console.Group` is then fed into a `rich.live.Live` object that manages the display, refreshing what's shown on screen at 60 Hz!

## Settings Update
If you're looking at [the complete `main.py` Transmitter program](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/main.py), you'll notice it *also* lets the pilot use the laptop to update both transmitter-side and quadcopter-side flight settings.

The ability to update these settings lives in the `update_settings()` function. This function first prints the current settings (idle throttle, max throttle, PID configurations, etc.) and then asks what the pilot wants to do, if anything.

![setings](https://i.imgur.com/dj1Wiyv.png)

From here, the pilot has a few options:
1. **Load Settings Profile**: pre-load default PID gains, values I use that are confirmed to work. You can adjust this PID profile in the source code if you wish.
2. **Update Controller Settings**: update the idle throttle and max throttle the transmitter constrains to.
3. **Update PID Settings**: enter interactive configuration where the pilot can punch in the unique PID gains for each setting (used for PID tuning).
4. **Adjust PID Master Multiplier**: apply a multiplier across all configured PID values. This is helpful when the pilot wants to increase or decrease the drone's responsiveness while keeping all PID gains proportional to each other.
5. **Send Settings to Drone**: send the PID settings the pilot set on the transmitter (currently "loaded and ready") off to the drone via a *Settings Update Packet* (read more about this in [Chapter 2](../chapter2)).
6. **Return**: go back to the main dashboard.

![flashing settings gif](https://i.imgur.com/fnvlLw3.gif)

*Above: from the main control interface, pressing 'S' on the keyboard, and then sending over a settings update packet, receiving confirmation from the drone, and then returning to the main control interface.*

While I removed it from the snippet above for simplicity, you'll see [in the full main.py file](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/main.py#L507) that the `continuous_display()` function checks for presses of the "s" key while in the main dashboard. If "s" is pressed, it fires off the `update_settings()` function, entering the settings menu.

## Validate Drone Connection
If you did look at the full `continuous_display()` function, you'll also see it [checks for the "c" key being pressed](https://github.com/TimHanewich/centauri/blob/880aef867fc2f1b2ec5d29fdde0b9acc81f665ad/components/transmitter/PC/src/main.py#L523). If "c" is pressed, it invokes the `validate_connection()` function, a simple function that tries to make contact with the quadcopter to confirm it's operational.

The `validate_connection()` function sends out a `TIMHPING` message and waits a moment; if the quadcopter is operational, it should send back a `TIMHPONG` message, which the transmitter listens for.

This is just a simple way for the pilot to confirm the quadcopter is on and functioning as expected!

## Close
Wonderful! With the *Centauri* quadcopter covered in previous chapters, the complete *Centauri* Transmitter system covered in this chapter and the last, and the communication protocol between the two covered in detail in [Chapter 2](../chapter2), we now fully understand how the two work together to achieve flight!

In the next chapter, we'll look at the *analysis* phase: extracting, unpacking, and analyzing telemetry recorded onboard the quadcopter. The final piece (for now) of the *Centauri* ecosystem!

Click here to continue reading in this series: [Full-Stack Flight, Chapter 8: Unpacking Flight Telemetry for Analysis](../chapter8).

*Ready to start building? [Join the Full Stack Flight Discord](https://discord.gg/wwqfmCUzGg) to ask questions, share progress, and connect with other makers building their own version of Centauri!*