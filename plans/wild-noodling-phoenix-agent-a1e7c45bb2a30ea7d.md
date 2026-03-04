# RTX 5090 + i9-13900K Gaming Optimization on Windows 11

## Research Summary

**Sources consulted:** 35+ unique URLs across Brave Search (7 queries) and Exa (4 semantic queries). Tavily was unavailable (HTTP 433 errors on all attempts).

**Date:** 2026-02-26

---

## 1. CRITICAL: NVIDIA Driver 595.59 -- PULLED TODAY (2026-02-26)

**Confidence: HIGH** (confirmed by NVIDIA, VideoCardz, Guru3D, HardForum, Reddit)

NVIDIA has **pulled driver 595.59 as of today** (Feb 26, 2026, 11am PT) after discovering a bug affecting fan control and clock speeds on RTX 50-series GPUs.

**Known issues with 595.59:**
- Fan monitoring/control broken on RTX 5090/5080 -- third-party tools (MSI Afterburner, GPU Tweak III, FanControl) cannot detect or control fans properly
- Lower peak GPU clocks reported; driver appears to cap voltage at ~0.95V, limiting boost frequency on RTX 5080/5090
- Black screens, VIDEO_TDR_FAILURE (nvlddmkm Event ID 153), crashes, freezes, and hard restarts reported
- Missing per-rail power reporting in HWInfo/GPU-Z/Afterburner (known bug across all 59x.xx drivers -- **fix: disable Fast Startup in Windows**)
- Forced Anisotropic Filtering bug on 50-series cards may still be present

**Action:** Roll back to **591.86 WHQL** immediately. This is the current recommended stable driver.

Sources:
- https://videocardz.com/newz/nvidia-unlaunches-its-geforce-595-59-driver-after-reports-of-fan-and-clock-issues
- https://www.reddit.com/r/nvidia/comments/1rfc1tu/game_ready_studio_driver_59559_faqdiscussion/
- https://hardforum.com/threads/595-59-nvida-drivers-feb-26th-2026.2046670/
- https://forums.guru3d.com/threads/nvidia-geforce-595-59-whql-driver.459519/page-7
- https://www.technetbooks.com/2026/02/nvidia-59559-driver-fan-bugs-and-rtx-50.html

---

## 2. NVIDIA Control Panel Global Profile for RTX 5090

**Confidence: HIGH** (corroborated across 6+ sources including rtx50series.co.uk optimization guide, storagediskprices.com, queleparece.com, YouTube guides)

### Recommended Global 3D Settings:

| Setting | Value | Rationale |
|---|---|---|
| **Power Management Mode** | Prefer Maximum Performance | Prevents GPU from downclocking during gameplay. Essential for RTX 5090. |
| **Texture Filtering - Quality** | High Performance | Minimal visual loss, measurable FPS gain. |
| **Texture Filtering - Anisotropic Sample Opt** | On | |
| **Texture Filtering - Negative LOD Bias** | Allow | |
| **Texture Filtering - Trilinear Optimization** | On | |
| **Low Latency Mode** | On | Use "On" (not "Ultra") globally. If game has NVIDIA Reflex, set to Off here and enable Reflex in-game instead -- they conflict. |
| **Threaded Optimization** | Auto | Let the driver decide per-app. |
| **Shader Cache Size** | Unlimited (or 10GB+) | Reduces shader compilation stutter on RTX 5090's large shader pipelines. |
| **Vertical Sync** | Off (globally) | Use in-game V-Sync or G-Sync instead. |
| **Triple Buffering** | Off | Only useful with V-Sync On (which we disabled). |
| **Max Frame Rate** | Off globally, set per-game | Cap per-game to monitor refresh rate + 2-3 FPS if using G-Sync. |
| **Anisotropic Filtering** | Application-controlled | Let games handle this. |
| **Antialiasing (all sub-settings)** | Application-controlled | DLSS handles this better than driver-level AA. |
| **CUDA - GPUs** | All | |
| **OpenGL Rendering GPU** | Your RTX 5090 | |
| **Background Application Max Frame Rate** | 20-30 FPS | Saves power when alt-tabbed. |
| **Image Scaling** | Off (use DLSS instead) | |
| **DSR - Factors** | Off unless using downsampling | |

Sources:
- https://rtx50series.co.uk/sensible-global-nvidia-control-panel-profile-rtx-5090/
- https://storagediskprices.com/nvidia-control-panel-best-settings/
- https://queleparece.com/article/ultimate-guide-nvidia-control-panel-optimization-for-gaming
- https://www.youtube.com/watch?v=D7PyvbnEwic

---

## 3. DLSS 4 Multi Frame Generation (MFG) Settings

**Confidence: HIGH** (NVIDIA official, Tom's Hardware, TechPowerUp, DSO Gaming)

### Key facts:
- DLSS 4 MFG generates **up to 3 additional AI frames** per rendered frame on RTX 50-series (up to 4x multiplier currently; 6x mode coming April 2026)
- **HAGS must be enabled** for MFG/Frame Generation to work (non-negotiable requirement)
- **NVIDIA Reflex must be enabled** alongside MFG to keep input latency low -- without Reflex, MFG adds significant perceived lag
- Average performance uplift: **~3.8x** at 4K with DLSS SR + MFG on RTX 5090 (NVIDIA's claim, verified by multiple reviewers)
- **Dynamic MFG** (coming April 2026 with DLSS 4.5) will auto-select the optimal MFG multiplier based on your display's refresh rate

### Recommended in-game DLSS 4 settings for RTX 5090 at 4K:
- **DLSS Super Resolution:** Quality or Balanced (avoid Performance unless path tracing)
- **Multi Frame Generation:** On (4x if framerate target allows; game-dependent)
- **NVIDIA Reflex:** On + Boost (mandatory with MFG)
- **Ray Reconstruction:** On (replaces traditional denoiser with AI -- better quality + performance)
- **Frame Rate Cap:** Match to monitor refresh rate when using MFG to avoid wasted AI frames

### Latency considerations:
- MFG with Reflex On keeps end-to-end latency comparable to native rendering at lower FPS
- MFG **without** Reflex can add 20-40ms of perceived input lag
- HAGS + Reflex together may add latency in some older titles (confirmed by Reddit testing) -- test per game

Sources:
- https://www.nvidia.com/en-us/geforce/news/dlss4-multi-frame-generation-ai-innovations/
- https://www.tomshardware.com/pc-components/gpus/nvidia-dlss-4-is-the-magic-bullet-behind-the-rtx-50-series-touted-2x-performance-reflex-2-multi-frame-gen-ai-tools-come-to-the-fore
- https://www.techpowerup.com/346029/nvidia-confirms-dynamic-multi-frame-generation-and-6x-mode-arrive-in-april
- https://www.dsogaming.com/articles/resident-evil-requiem-path-tracing-dlss-4-5-benchmarks/

---

## 4. Hardware Accelerated GPU Scheduling (HAGS)

**Confidence: MEDIUM** (conflicting reports; nuanced per-game behavior)

### The verdict for RTX 5090:
- **Average FPS gain from HAGS: ~0.3%** -- effectively negligible for raw framerate (Tech Business News testing, 2026)
- HAGS consumes **up to 1GB extra VRAM** (less of a concern on RTX 5090's 32GB, but still noted)
- **HAGS is REQUIRED** for Frame Generation and Multi Frame Generation to function
- Earlier HAGS versions caused stuttering; modern implementations (Windows 11 23H2+) have this fixed
- HAGS + Reflex together: one confirmed report of added latency when both enabled simultaneously (Reddit/r/nvidia thread), though this is disputed

### Recommendation:
- **Leave HAGS ON** -- it is required for MFG/Frame Gen, and the stuttering issues from earlier Windows builds are resolved
- If you experience crashes in specific titles (e.g., some RTX 5090 users report 100% GPU usage + crash with HAGS on), test that title with HAGS off -- but you lose Frame Gen
- **Disable Windows Fast Startup** (separate from HAGS) to fix power reporting bugs in monitoring tools

Sources:
- https://www.techbusinessnews.com.au/hardware-accelerated-gpu-scheduling-the-2025-2026-truth-nobodys-telling-you/
- https://thepcbottleneckcalculator.com/hardware-accelerated-gpu-scheduling/
- https://forums.guru3d.com/threads/hardware-accelerated-gpu-scheduling.455317/
- https://www.reddit.com/r/hardware/comments/1iej4ri/where_are_the_windows_hags_on_vs_off_results_for/
- https://www.reddit.com/r/OptimizedGaming/comments/1abhnko/does_hardware_accelerated_gpu_scheduling_have_any/

---

## 5. i9-13900K: Thread Director, P-cores/E-cores, and Windows 11

**Confidence: HIGH** (Intel official, Tom's Hardware forums, Overclockers UK, Reddit/r/intel, Eleven Forum)

### Windows 11 is mandatory for this CPU:
- Windows 11's scheduler has **Intel Thread Director** integration that correctly assigns workloads to P-cores vs E-cores
- Windows 10 lacks Thread Director support entirely -- the scheduler treats all 32 threads equally, leading to performance and efficiency loss
- Thread Director in Win11 is "light years ahead" of Win10 scheduling (multiple Reddit/forum confirmations)

### E-cores: keep them ON (with caveats):
- **Do NOT disable E-cores** in BIOS for general gaming -- Thread Director on Win11 handles allocation well
- Disabling E-cores on Win11 **hurts performance** because Thread Director gets confused handling only logical P-core threads with no physical E-cores
- Exception: some specific games (e.g., Star Citizen) may benefit from E-core disabling, but this is game-specific and should be tested, not defaulted
- **Process Lasso** can be used for per-game core affinity assignments if specific titles have issues, but is generally unnecessary on Win11

### Power plan:
- Use **Balanced** power plan (not High Performance) -- on Win11 with Thread Director, Balanced allows proper P/E core scheduling. High Performance forces all cores to max frequency unnecessarily
- If using High Performance plan, ensure min/max CPU performance are both set to 100%

Sources:
- https://www.reddit.com/r/intel/comments/15514mn/is_windows_10_now_good_for_an_i9_13900k_or_is/
- https://forums.tomshardware.com/threads/i9-13900k-clock-speed.3831280/
- https://forums.overclockers.co.uk/threads/on-intel-raptor-lake-any-truth-to-the-rumors-that-disabling-all-e-cores-hurts-single-threaded-performance-of-the-p-cores.18962512/page-3
- https://www.elevenforum.com/t/forcing-performance-mode-for-background-app-on-intel-p-e-core-cpu.15763/
- https://www.cgmagonline.com/review/hardware/intel-core-i9-13900k-cpu/

---

## 6. i9-13900K: BIOS Power Limits and Stability (CRITICAL)

**Confidence: HIGH** (Intel official, Puget Systems, Overclock.net, MSI blog, Reddit megathreads)

### The degradation issue you MUST address:
Intel 13th/14th Gen K/KF/KS CPUs have a **confirmed Vmin shift instability** issue caused by elevated operating voltages. This can cause:
- Game crashes, random BSODs, "Out of video memory" errors
- Progressive CPU degradation over time (irreversible)
- Crashes specifically in Unreal Engine games

### Required BIOS actions:
1. **Update BIOS to include microcode 0x12B or later** -- this is the final comprehensive fix encompassing 0x125 and 0x129 patches
   - 0x129: caps voltage requests above 1.55V
   - 0x12B: additionally addresses elevated voltages during idle/light activity
2. **Apply Intel Default Settings** (also called "Intel Baseline Profile" on some boards):
   - PL1 = PL2 = **253W** (Intel spec for 13900K)
   - IccMax = **307A** (Intel spec)
   - Disable MCE (MultiCore Enhancement) or set to "Enforce All Limits"
   - SVID Behavior: set to **"Typical"** or **"Best Case"** (not "Auto" which some boards set too aggressively)
3. **For gaming specifically**, unlimited power is wasteful -- games rarely draw more than 150-200W on a 13900K:
   - Setting PL1=PL2=253W loses negligible gaming FPS vs unlimited
   - Setting PL1=PL2=200-220W loses ~1-3% gaming FPS but drops temps by 15-20C
   - The CPU achieves **5.4GHz all P-cores** on light/gaming loads and **5.8GHz** on the best 2 cores at stock 253W

### Recommended safe gaming profile:
| Setting | Value |
|---|---|
| MCE | Disabled / Enforce All Limits |
| PL1 | 253W (or 200-220W for cooler operation) |
| PL2 | 253W (set equal to PL1) |
| IccMax | 307A (Intel spec) or 400A (if no current throttling) |
| Thermal Limit | 100C (Intel spec) or 90C (conservative) |
| CEP (Current Excursion Protection) | Auto or Enabled |
| SVID | Typical |
| C-States | Enabled (for idle power savings; does not affect gaming perf) |

### Performance impact of Intel Defaults vs Unlimited:
- Puget Systems testing: MCE Auto + unlimited power hits 100C+ on stress tests
- Intel defaults (253W): ~3-5% lower multi-core benchmark scores vs unlimited, but **nearly identical gaming FPS**
- Power scaling is highly non-linear: the 13900K at 200W achieves ~90% of the performance of 300W+ unlimited

Sources:
- https://community.intel.com/t5/Mobile-and-Desktop-Processors/Microcode-0x129-Update-for-Intel-Core-13th-and-14th-Gen-Desktop/m-p/1622129
- https://www.pugetsystems.com/labs/articles/intel-core-i9-13900k-impact-of-multicore-enhancement-mce-and-long-power-duration-limits-on-thermals-and-content-creation-performance-2375/
- https://www.reddit.com/r/overclocking/comments/1axepvu/optimizing_stability_for_intel_13900k_and_14900k/
- https://www.msi.com/blog/improving-gaming-stability-for-intel-core-i9-13900k-and-core-i9-14900k
- https://blog.anildevran.com/13900k-bios-optimization-and-smooth-gaming-guide-daily-stable-setup/
- https://www.overclock.net/threads/asus-maximus-z790-and-intel-i9-13900k-14900k-an-overclocking-and-tuning-guide.1801569/
- https://www.pcgamer.com/hardware/processors/intel-cpu-crashes-what-you-need-to-knowmicrocode-to-blame-but-fix-incoming-this-month-alongside-two-year-extended-warranty/

---

## 7. Z790 BIOS: XMP, Resizable BAR, and Other Settings

**Confidence: HIGH** (ASUS BIOS manuals, Overclock.net guide, Reddit, rtx50series.co.uk)

### Essential BIOS settings for RTX 5090 + 13900K on Z790:

| Setting | Value | Notes |
|---|---|---|
| **XMP** | Enable (Profile 1 or 2) | RAM should run at rated speed. DDR5-6000+ CL30 is sweet spot for 13900K. |
| **Above 4G Decoding** | Enabled | Required for Resizable BAR |
| **Resizable BAR** | Enabled | Allows GPU to access full VRAM; ~3-5% FPS gain in most titles. Some older games may lose 1-2%. |
| **Re-Size BAR Support** / **SR-IOV** / **MIMO** | Enabled | Z790 boards may have additional sub-settings under PCIe configuration |
| **CSM (Compatibility Support Module)** | Disabled | Must be disabled for Resizable BAR to work |
| **PCIe Slot Speed** | Gen 4 (or Auto) | RTX 5090 is PCIe 5.0 x16, but some early black screen issues resolved by forcing Gen 4. Test Auto first; drop to Gen 4 if instability occurs. |
| **C-States** | Enabled | Safe for gaming; saves power at idle. Disable only if experiencing wake/sleep issues. |
| **ASPM** | Disabled | Can cause stutter; disable for consistent gaming performance |
| **PCIe Native Power Management** | Disabled | Same rationale as ASPM |
| **Fast Boot** | Disabled | Slows boot by a few seconds but avoids hardware detection issues |

### XMP stability note for 13900K:
- 4 DIMM configurations at 6000+ MHz can be unstable -- requires manual tuning of DRAM voltages (1.35-1.40V VDD/VDDQ) and possibly SA voltage (1.10-1.15V)
- 2 DIMM configurations at XMP speeds are generally stable out of the box
- If XMP is unstable, try enabling "XMP Tweaked" (ASUS) or reducing frequency by one step

Sources:
- https://dlcdnets.asus.com/pub/ASUS/mb/LGA1700/ROG_MAXIMUS_Z790_DARK_HERO/E22758_ROG_Z790_Series_BIOS_Manual_Intel_14th_EM_WEB.pdf
- https://www.overclock.net/threads/asus-maximus-z790-and-intel-i9-13900k-14900k-an-overclocking-and-tuning-guide.1801569/
- https://www.reddit.com/r/buildapc/comments/100pycr/dont_know_how_to_enable_resizable_bar_on_gigabyte/
- https://rtx50series.co.uk/bios-and-windows-tweaks-rtx-5090/

---

## 8. Windows 11 OS-Level Optimizations

**Confidence: HIGH** (rigpod.com guide, rtx50series.co.uk, xda-developers, evezone)

### Settings to configure:

| Setting | Location | Value |
|---|---|---|
| **Game Mode** | Settings > Gaming > Game Mode | ON (improved significantly since early Win11) |
| **Hardware Accelerated GPU Scheduling** | Settings > Display > Graphics | ON (required for MFG) |
| **Variable Refresh Rate** | Settings > Display > Graphics | ON |
| **Power Plan** | Settings > Power | Balanced (recommended) or High Performance |
| **Fast Startup** | Control Panel > Power Options > Choose what power buttons do | OFF (fixes monitoring bugs with 59x drivers) |
| **Core Isolation / Memory Integrity (VBS)** | Settings > Privacy & Security > Device Security | OFF for gaming (can cost 5-10% FPS in some titles) |
| **Disable fullscreen optimizations** | Per-game .exe Properties > Compatibility | Test per game; some benefit, some don't |
| **Background Apps** | Settings > Apps > Installed Apps | Disable unnecessary background apps |

### Debloating (optional but recommended):
- Remove unnecessary Microsoft apps (Teams, OneDrive, Copilot) or use Win11Debloat script
- Disable Cortana, Tips, Suggested Actions
- Reduce visual effects: Settings > Accessibility > Visual Effects > Animation Effects: Off

Sources:
- https://rigpod.com/windows-11-gaming-optimization-settings/
- https://rtx50series.co.uk/bios-and-windows-tweaks-rtx-5090/
- https://www.xda-developers.com/cardinal-rules-setting-up-new-gaming-pc/
- https://evezone.evetech.co.za/performance-pulse/optimize-windows-11-gaming-2026-fps-guide

---

## 9. RTX 5090 Black Screen / Stability Troubleshooting

**Confidence: HIGH** (NVIDIA forums, TechPowerUp, PC Gamer, NotebookCheck)

Known RTX 5090 stability issues and fixes:

1. **Black screens during gaming/benchmarks:**
   - First try: Force **PCIe Gen 4** in BIOS instead of Gen 5 or Auto
   - Perform **clean driver install** (use DDU in Safe Mode, then install 591.86)
   - Disable **Fast Startup** in Windows
   - Ensure PSU has **adequate 12VHPWR/16-pin** cable (no adapters if possible)
   - Check for BIOS updates from motherboard vendor

2. **Stuttering despite high FPS:**
   - Ensure **Resizable BAR** is correctly enabled (verify in GPU-Z)
   - Check that DLSS is not set to Ultra Performance (introduces artifacts/stutter)
   - Enable **NVIDIA Reflex** in-game
   - Set **Shader Cache** to Unlimited in NVIDIA Control Panel
   - First game launch after driver install will compile shaders -- wait for it to finish

3. **Driver-specific issues:**
   - **591.86**: Current recommended driver. Some display corruption reports but generally stable.
   - **595.59**: PULLED as of today. Do not install. Roll back if already installed.
   - All 59x.xx drivers: disable Fast Startup to fix per-rail power monitoring

Sources:
- https://www.techpowerup.com/332383/nvidia-investigating-reported-geforce-rtx-5090-5080-black-screen-stability-issues
- https://www.pcgamer.com/hardware/graphics-cards/nvidia-is-investigating-the-reported-issues-with-the-rtx-50-series-cards-after-rtx-5090-and-rtx-5080-owners-and-some-rtx-40-series-folk-report-black-screen-problems/
- https://www.nvidia.com/en-us/geforce/forums/geforce-graphics-cards/5/556923/rtx-5090rtx-5080-black-screen-fix/
- https://www.notebookcheck.net/RTX-5090-and-RTX-5080-users-complain-about-black-screen-issues-drivers-likely-to-blame.958160.0.html
- https://rtx50series.co.uk/firmware-driver-stack-that-talks-to-rtx-5090/

---

## Contradictions Between Sources

1. **HAGS On vs Off:** Tech Business News says ~0.3% FPS gain (negligible); some Reddit users report 10-20% improvement from disabling HAGS in specific titles (Horizon Forbidden West). Resolution: HAGS effect is title-dependent. Keep it ON as baseline (required for MFG), test per-game if issues arise.

2. **E-cores On vs Off:** Star Citizen community strongly recommends disabling E-cores; most other sources say keep them on with Win11 Thread Director. Resolution: Game-specific. Default to ON; only disable for documented problematic titles.

3. **Power Plan (Balanced vs High Performance):** Some older guides insist on High Performance; newer Win11 sources recommend Balanced for proper Thread Director operation. Resolution: Use Balanced on Win11 with Raptor Lake -- Thread Director needs the frequency stepping that Balanced provides.

4. **13900K degradation -- is it fixed?** Intel says microcode 0x12B fixes the root cause. Second Reddit megathread (2025) documents continued degradation even on fresh CPUs with all mitigations. Resolution: The fix prevents further damage on healthy CPUs but cannot reverse existing degradation. Apply mitigations immediately; if already experiencing instability, CPU may be permanently damaged -- contact Intel for warranty replacement (extended 2-year warranty available).

5. **Resizable BAR on RTX 5090:** rtx50series.co.uk recommends it ON; one Tom's Hardware forum post notes it can cause "inconsistent FPS in Warzone." Resolution: Enable globally, disable per-game if needed. The RTX 5090 benefits more from ReBAR than older GPUs.

---

## Gaps for Further Research

1. **DLSS 4.5 + Dynamic MFG** -- arriving April 2026. Current settings may need revision after this update.
2. **591.86 driver long-term stability** on RTX 5090 -- limited reports; it is the "best available" but not without issues.
3. **Exact gaming FPS impact of 0x12B microcode** on 13900K -- Puget Systems tested content creation workloads but gaming-specific benchmarks with the latest microcode are sparse.
4. **VBS/Core Isolation performance impact** specifically on RTX 5090 + 13900K -- most testing is on different hardware combinations.
5. **Optimal DLSS SR preset** for RTX 5090 at 4K -- Quality vs Balanced has minimal documentation specific to this GPU tier.

---

## Quick-Reference Optimization Checklist

### BIOS (do first):
- [ ] Update BIOS to latest with microcode 0x12B+
- [ ] Enable XMP for rated RAM speed
- [ ] Set PL1 = PL2 = 253W (Intel spec)
- [ ] Disable MCE or set to "Enforce All Limits"
- [ ] Enable Above 4G Decoding + Resizable BAR
- [ ] Disable CSM
- [ ] PCIe slot: Auto (or Gen 4 if black screens)
- [ ] Disable ASPM and PCIe Native Power Management
- [ ] Keep C-States enabled

### Windows 11:
- [ ] Enable Game Mode
- [ ] Enable HAGS
- [ ] Disable Fast Startup
- [ ] Disable VBS/Core Isolation Memory Integrity
- [ ] Use Balanced power plan
- [ ] Debloat unnecessary background apps

### NVIDIA Driver:
- [ ] Install 591.86 WHQL (NOT 595.59)
- [ ] Clean install via DDU in Safe Mode
- [ ] Apply NVIDIA Control Panel global settings (see Section 2)
- [ ] Set Shader Cache to Unlimited

### Per-Game:
- [ ] Enable DLSS 4 (Quality or Balanced SR + MFG)
- [ ] Enable NVIDIA Reflex On + Boost
- [ ] Enable Ray Reconstruction where available
- [ ] Set NCP Low Latency to Off for games with native Reflex
- [ ] Cap FPS to monitor refresh rate when using MFG

---

*Research conducted 2026-02-26. 35+ unique sources from Brave Search and Exa. Tavily unavailable (HTTP 433). Perplexity not needed -- sufficient cross-source verification achieved.*
