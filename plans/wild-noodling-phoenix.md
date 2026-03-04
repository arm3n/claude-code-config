# Gaming Optimization Plan — Sequential Application

## Context
System analysis + deep research (67+ sources across Brave, Exa, Tavily, Gemini) revealed ~10-20% performance left on the table on an i9-13900K / RTX 5090 / 32GB DDR5-6000 / Win11 Build 26200 system. Research uncovered several corrections to the original analysis and new critical findings.

**Key research corrections:**
- Power plan should stay **Balanced** (not High Performance) — Thread Director needs frequency stepping
- NVIDIA driver **595.59 was pulled today** (Feb 26, 2026) — fan control failures, lower clocks, crashes
- 13900K has a known **Vmin shift degradation** issue — microcode 0x12B fix is critical
- Resizable BAR is **already enabled** (BAR1=32768 MiB = full 32GB VRAM access)
- HAGS must stay **ON** — required for DLSS 4 Multi Frame Generation
- Several new optimizations were missed in original analysis (NVCP profile, ISLC, Fast Startup, Reflex 2.0)

Fixes are ordered by impact, applied one at a time with user verification between each.

---

## Fix 0: URGENT — Roll Back NVIDIA Driver 595.59
- **Impact:** Prevents fan control failure, lower-than-expected clocks, black screens, VIDEO_TDR_FAILURE crashes
- **Details:** NVIDIA pulled 595.59 today (Feb 26, 2026). Confirmed by VideoCardz, Guru3D, HardForum, r/nvidia
- **Action:** Use DDU in Safe Mode to clean uninstall, then install 591.86 WHQL
- **Also:** Disable Windows Fast Startup (`powercfg /h off`) — fixes HWInfo/GPU-Z monitoring bugs on all 59x.xx drivers
- **Verify:** `nvidia-smi` shows driver 591.86; fan monitoring works in HWInfo/GPU-Z
- **Confidence:** HIGH (5 sources)

## Fix 1: Power Plan Tuning (Stay on Balanced)
- **Impact:** Proper CPU scheduling + disable power-saving features that cause stutter
- **Details:** Research found Balanced is correct for 13900K — Thread Director needs frequency stepping. High Performance locks all cores high and confuses Thread Director, actually *hurting* gaming performance
- **Actions (within Balanced plan):**
  - Disable USB Selective Suspend: `powercfg /setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0`
  - Disable PCI Express Link State PM: `powercfg /setacvalueindex SCHEME_CURRENT 501a4d13-42af-4429-9fd1-a8218c268e20 ee12f906-d277-404b-b6da-e5fa1a576df5 0`
  - `powercfg /setactive SCHEME_CURRENT`
- **Verify:** `powercfg /getactivescheme` still Balanced; USB Suspend OFF; PCIe ASPM OFF
- **Confidence:** HIGH (5 sources — Intel official, Tom's HW, Overclockers UK, Reddit r/intel)

## Fix 2: Hyper-V + VBS Disable
- **Impact:** 5-15% FPS recovery (biggest single fix)
- **Details:** VBS Status=2 (running), HypervisorPresent=True. Confirmed 5-15% FPS cost across 14+ sources. Microsoft themselves acknowledge "gamers who want to prioritize performance have the option to turn off these features"
- **Actions (all require elevation):**
  - Core Isolation off: `reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v Enabled /t REG_DWORD /d 0 /f`
  - **CRITICAL (24H2/25H2):** GUI disable does NOT fully disable VBS. Must also set: `reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard" /v EnableVirtualizationBasedSecurity /t REG_DWORD /d 0 /f`
  - Disable Hyper-V: `dism /online /disable-feature /featurename:Microsoft-Hyper-V-All /norestart`
  - Disable VMP: `dism /online /disable-feature /featurename:VirtualMachinePlatform /norestart`
  - `bcdedit /set hypervisorlaunchtype off`
  - Reboot
- **Warning:** Breaks WSL2 and Windows Sandbox — confirm with user first
- **Verify:** After reboot: `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent` = False; VBS Status = 0
- **Confidence:** HIGH (14+ sources)

## Fix 3: 13900K Microcode + BIOS Verification
- **Impact:** Prevents irreversible CPU degradation; ensures optimal BIOS config
- **Details:** Intel confirmed Vmin shift instability in 13th/14th Gen K-series. Microcode 0x12B is the final fix. ASUS PRIME Z790-P WIFI BIOS 1821 (Aug 2025) should include it but must verify
- **Actions:**
  - Check current microcode: `reg query "HKLM\HARDWARE\DESCRIPTION\System\CentralProcessor\0" /v "Update Revision"`
  - Verify BIOS settings: Above 4G Decoding=ON, Resizable BAR=ON (already confirmed via BAR1=32GB), CSM=OFF, XMP=ON (already at 6000MHz)
  - Verify power limits: PL1=125W, PL2=253W (Intel defaults), not unlimited
  - Disable ASPM (Active State Power Management) for consistent frametimes
  - Keep C-states enabled (no gaming impact, saves idle power)
- **Verify:** Microcode shows 0x12B or newer; BIOS settings confirmed
- **Confidence:** HIGH (7 sources — Intel Community, Puget Systems, Overclock.net, MSI, PC Gamer)

## Fix 4: NVIDIA Control Panel Global Profile
- **Impact:** Ensures GPU runs at full performance with minimal latency
- **Actions (Manage 3D Settings → Global):**
  - Power Management Mode → **Prefer Maximum Performance**
  - Low Latency Mode → **On** (set to Off for games with native Reflex — they conflict)
  - Texture Filtering Quality → **High Performance**
  - Shader Cache Size → **Unlimited**
  - V-Sync → **Off** (use G-Sync/VRR + in-game framerate cap instead)
  - Threaded Optimization → **Auto**
  - Anisotropic Filtering → **Application-controlled**
  - Triple Buffering → **Off**
  - Max Frame Rate → **Off** (use in-game or RTSS cap instead)
- **Also:** Enable G-Sync Compatible in Display settings; set preferred refresh rate to Highest Available
- **Verify:** Screenshot NVCP settings
- **Confidence:** HIGH (6 sources — rtx50series.co.uk, storagediskprices.com, frameboost.net, Reddit)

## Fix 5: Mouse Acceleration Off
- **Impact:** Consistent 1:1 input for aiming
- **Details:** MouseSpeed=1, Thresholds set = Enhanced Pointer Precision is ON
- **Action:**
  - `reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_SZ /d "0" /f`
  - `reg add "HKCU\Control Panel\Mouse" /v MouseThreshold1 /t REG_SZ /d "0" /f`
  - `reg add "HKCU\Control Panel\Mouse" /v MouseThreshold2 /t REG_SZ /d "0" /f`
- **Verify:** Settings > Bluetooth & devices > Mouse > Additional mouse settings > "Enhance pointer precision" unchecked
- **Confidence:** HIGH (universal consensus)

## Fix 6: Network Stack Tuning
- **Impact:** 10-40ms latency reduction for online games
- **Actions:**
  - Disable Nagle on Ethernet adapter `{E89E53EA-652B-4B2B-A4E8-B3C34D3571E4}`:
    - `reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\{E89E53EA-652B-4B2B-A4E8-B3C34D3571E4}" /v TcpNoDelay /t REG_DWORD /d 1 /f`
    - `reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\{E89E53EA-652B-4B2B-A4E8-B3C34D3571E4}" /v TcpAckFrequency /t REG_DWORD /d 1 /f`
  - Network throttling:
    - `reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 0xFFFFFFFF /f`
    - `reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f`
  - DNS: Set primary to 1.1.1.1, secondary 1.0.0.1 (Cloudflare is 3-5ms faster for connection establishment — note: DNS does NOT affect in-game latency, only matchmaking/server browser/lobby entry)
  - **Intel X550-T2 specific tuning** (from Intel community + GamingPCSetup research):
    - Set Interrupt Moderation to **Medium** (not Off — controlled testing shows 90th-percentile DPC < 1μs)
    - Enable **Low Latency Interrupts** (bypasses moderation for certain TCP packets)
    - Disable **Flow Control** and **Energy Efficient Ethernet**
    - Set **RSS queues** bound to non-primary cores
- **Verify:** Registry values confirmed; NIC advanced properties in Device Manager; `nslookup` shows 1.1.1.1
- **Confidence:** HIGH (Nagle: universal; NIC tuning: Intel official + GamingPCSetup; Throttling: multiple guides)

## Fix 7: MMCSS Gaming Profile
- **Impact:** Better thread scheduling priority for games
- **Actions:**
  - `reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v Priority /t REG_DWORD /d 6 /f`
  - `reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f`
  - `reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v "SFIO Priority" /t REG_SZ /d "High" /f`
- **Verify:** Registry values confirmed
- **Confidence:** MEDIUM (still recommended in 2026 guides, but impact is smaller on modern hardware)

## Fix 8: ISLC (Intelligent Standby List Cleaner) — OPTIONAL
- **Impact:** Prevents micro-stutters in extended gaming sessions; also sets 0.5ms timer resolution
- **Details:** With 32GB RAM, standby list management is less critical than on 8-16GB systems (ElevenForum consensus). However, ISLC's **timer resolution** feature (0.5ms vs default 15.6ms) is valuable for frame pacing. Win11 changed timer res to per-process, so ISLC helps restore global behavior
- **Recommendation:** Install primarily for the timer resolution benefit. If you experience no stutters, the memory purging is optional
- **Actions:**
  - Download ISLC from wagnardsoft.com
  - Settings: List size threshold = 8192 MB, Free memory threshold = 2048 MB
  - Enable "Custom Timer Resolution" = 0.5ms
  - Set to launch at startup, minimize to tray
- **Verify:** ISLC running in system tray; dpclat.exe showing ~0.5ms timer resolution
- **Confidence:** MEDIUM for memory cleaning on 32GB; HIGH for timer resolution benefit

## Fix 9: Visual Effects + Background Apps + Startup Cleanup
- **Impact:** Minor — frees GPU/CPU cycles, reduces memory pressure
- **Actions:**
  - Disable transparency: Settings > Personalization > Colors > Transparency effects OFF
  - Disable animation effects: Settings > Accessibility > Visual effects > Animation effects OFF
  - Disable background apps: Settings > Apps > Installed apps > disable background for non-essential apps
  - Disable startup items (Task Manager > Startup): Canon MF Scanner Selector, Blackmagic Desktop Video Updater, iTunesHelper, Bluetooth Battery Monitor
  - **Investigate ICNow** — consuming 6217 CPU seconds, 218MB RAM. Determine what it is and whether it should be removed
- **Verify:** Task Manager startup tab shows only essential items

## Fix 10: In-Game Settings (per-game, ongoing)
- **Impact:** Maximizes RTX 5090 features
- **Details:**
  - Enable **NVIDIA Reflex On + Boost** in every supported game (Reflex 2.0 is new with RTX 50 series)
  - Enable **DLSS 4 Multi Frame Generation** in supported titles (requires HAGS ON)
  - Use DLSS SR **Quality** preset at 4K (5090 has the headroom)
  - Cap framerate to **display refresh - 3** (162 FPS for 165Hz) when using G-Sync/VRR to stay in VRR window
  - Disable in-game V-Sync when using G-Sync
- **Confidence:** HIGH (NVIDIA official, Tom's HW, TechPowerUp)

---

## Already Optimal (confirmed by research)
- DDR5-6000 — confirmed sweet spot for 13th gen Intel
- HAGS enabled — required for DLSS 4 MFG
- Game DVR disabled
- TRIM enabled on both drives
- Resizable BAR enabled (BAR1=32768 MiB)
- XMP at rated speed
- Display running at 165Hz

## Decided NOT to recommend (with rationale)
- **Spectre/Meltdown mitigation disable** — security risk outweighs ~2-3% gaming gain
- **E-core disabling** — Thread Director on Win11 handles this correctly; disabling hurts performance
- **Fullscreen Optimizations global disable** — modern Win11 handles this better; test per-game only
- **Win11 debloat scripts** — too aggressive for a daily-use machine; manual cleanup in Fix 9 is safer

## Research Sources
67+ unique sources across Brave Search, Exa, Tavily, and Gemini verification. Key authoritative sources:
- rtx50series.co.uk (6 RTX 5090-specific optimization guides)
- Intel Community + Puget Systems (13900K degradation + microcode)
- NVIDIA official (Reflex 2.0, DLSS 4, driver notices)
- VideoCardz, Guru3D (driver 595.59 pull notice)
- Tom's Hardware, TechPowerUp, Digital Trends (benchmarks)
- Hone.gg, GameHazards, EasyGamerSetups (Win11 VBS benchmarks: 5-15% FPS cost)
- Reddit r/nvidia, r/overclocking, r/Windows11 (community consensus)
- Overclock.net (ASUS Z790 tuning mega-guide)
- WagnardSoft (ISLC documentation)

---

Each fix: apply → verify → user approves → next fix.
