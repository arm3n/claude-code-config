# Windows 11 Gaming Optimization Research: Build 26200+ (2025-2026)

**Research date:** 2026-02-26
**Sources searched:** Brave Search, Exa, WebSearch (Tavily returned 433 errors throughout)
**Unique sources identified:** 28
**Build context:** Windows 11 25H2 (build 26200.x) and upcoming 26H2

---

## SYNTHESIZED FINDINGS BY TOPIC

---

### 1. Windows 11 26H2 / Recent Build Gaming Optimizations

**Confidence: HIGH**

Microsoft has publicly committed to a "Performance Fundamentals" initiative for 2026, explicitly targeting four pillars: background workload management, power and scheduling improvements, graphics stack optimizations, and updated drivers. The Xbox Fullscreen Experience (FSE) already demonstrated in testing a 9.3% RAM reduction and up to 8.6% FPS improvement by reducing background overhead. Windows 11 25H2 now edges ahead of Windows 10 in gaming performance across a 14-game TechSpot benchmark (Ryzen 9800X3D + RTX 5090), though results are hardware-dependent.

Key 2026 features in pipeline: Advanced Shader Delivery (ASD) expansion to handhelds, Auto SR for AMD silicon, improved process scheduling for modern multi-core CPUs, and controller-focused UI improvements.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 1 | https://www.windowslatest.com/2025/12/11/microsoft-finally-admits-windows-11-needs-real-performance-upgrade-especially-for-gaming/ | Microsoft's "Performance Fundamentals" plan for 2026; console-like gaming behavior | 2025-12-11 |
| 2 | https://www.pcmag.com/news/microsoft-pledges-to-make-windows-faster-for-gaming-in-2026 | ~10% memory reduction, 8%+ FPS gain from Xbox FSE | 2025-12 |
| 3 | https://www.techspot.com/article/3081-windows-11-vs-windows-10-gaming/ | Windows 11 25H2 edges ahead of Windows 10 in 14-game average | 2025-late |
| 4 | https://www.techpowerup.com/343895/microsoft-promises-more-performant-windows-11-optimized-for-gaming | Xbox FSE: 9.3% RAM drop, 8.6% FPS gain; ASD expansion planned | 2025-12-10 |
| 5 | https://www.igorslab.de/en/windows-11-microsoft-promises-more-gaming-performance-for-2026/ | AI upscaling, early shader processing, optimized prioritization | 2025-12 |

---

### 2. VBS / Memory Integrity (HVCI) Impact on Gaming

**Confidence: HIGH** -- This is the most well-documented optimization area with consistent numbers across multiple independent sources.

Virtualization-Based Security (VBS) and Memory Integrity (HVCI) remain the single largest default-enabled performance drain for gaming on Windows 11. Multiple independent sources converge on these numbers:

- **Average FPS impact:** 4-6% across most titles (Tom's Hardware, Windows Forum, multiple benchmarks)
- **CPU-bound scenarios:** 5-15% FPS loss, with some extreme cases up to 28% (GameHazards)
- **Specific examples:** Microsoft Flight Simulator sees 10-15% improvement when VBS disabled; Fortnite on Ryzen 9 9950X3D showed 91 FPS difference (1080p low) between Win10 and Win11 with VBS on
- **Modern CPUs with MBEC** (Intel 7th-gen+, AMD Zen 2+) have significantly reduced overhead vs older CPUs
- **24H2/25H2 note:** Disabling Memory Integrity in the GUI does NOT fully disable VBS. Must set registry key `HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\EnableVirtualizationBasedSecurity` to 0, or disable SVM/VT-X in BIOS

Microsoft itself acknowledged in 2022-2023 that VBS/HVCI can impact gaming and recommends toggling off while gaming.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 6 | https://www.tomshardware.com/news/windows-vbs-harms-performance-rtx-4090 | VBS slows games up to 10% even on RTX 4090 | 2023-03-14 |
| 7 | https://www.thefpsreview.com/2025/03/13/amd-ryzen-9-9950x3d-delivers-nearly-20-uplift-in-performance-on-windows-10-vs-windows-11-vbs-in-new-gaming-benchmarks/ | Ryzen 9950X3D: ~20% uplift Win10 vs Win11+VBS in Fortnite | 2025-03-13 |
| 8 | https://gamehazards.com/article/windows-11-gaming-performance-issues | 5-15% FPS cost in CPU-bound scenarios; up to 28% in extreme cases | 2025 |
| 9 | https://windowsforum.com/threads/windows-11-24h2-performance-real-gains-vs-windows-10-at-end-of-support.377105/ | 4-10% typical FPS impact; higher losses in 1% lows on CPU-bound titles | 2025 |
| 10 | https://hone.gg/blog/optimize-windows-11-for-gaming/ | VBS costs up to 5% gaming perf; MSFS sees 10-15% improvement when disabled | 2025-07-25 |
| 11 | https://www.reddit.com/r/Amd/comments/1fums7b/psa_disabling_memory_integrity_in_windows_11_24h2/ | PSA: Disabling Memory Integrity in 24H2 GUI does NOT disable VBS; registry required | 2024-10-02 |
| 12 | https://ayodesk.com/blog/memory-integrity-and-gaming-performance/ | Newer CPUs with MBEC significantly reduce HVCI overhead; 5-20% range depending on hardware | 2025-03-19 |
| 13 | https://mspoweruser.com/microsoft-says-2-virtualization-features-can-affect-gaming-performance-in-windows-11/ | Microsoft officially acknowledges VMP + HVCI affect gaming | 2022 |

---

### 3. Hyper-V Gaming Performance Overhead

**Confidence: MEDIUM** -- Fewer precise benchmarks; most data is user-reported rather than controlled tests.

The Hyper-V hypervisor runs in the background when enabled (even if no VMs are active), inserting a thin virtualization layer between the OS and hardware. This is closely related to VBS since VBS requires the hypervisor. Disabling Hyper-V and Virtual Machine Platform is widely recommended for gaming if you do not need VMs.

- Disabling Hyper-V + VMP reported to free "considerable resources" (XDA Developers)
- In CPU-limited scenarios, disabling all virtualization features can yield 5-15% uplift (Reddit r/OptimizedGaming)
- The overhead manifests most in 1% low frame times rather than average FPS
- Conflicting anecdotes: some users report 50 FPS gains, others report black screens after disabling -- likely caused by incorrect disable method or driver conflicts
- On gaming handhelds (Z1/Z2 Extreme), VBS + Hyper-V overhead is more noticeable due to constrained hardware

**How to disable:** Settings > Apps > Optional Features > More Windows Features > uncheck "Hyper-V" and "Virtual Machine Platform" > restart. Or PowerShell: `Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-Hypervisor`

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 14 | https://www.xda-developers.com/im-stuck-with-windows-for-gaming-in-2026-but-heres-how-im-optimizing-it/ | Disable VMP to free considerable resources; practical optimization walkthrough | 2026-01 |
| 15 | https://linustechtips.com/topic/1610616-disable-hyper-v-in-windows-11-ryzen-7940hx/ | Contradicting reports: 50 FPS gains vs black screens; highly system-dependent | 2025-05-01 |
| 16 | https://www.reddit.com/r/OptimizedGaming/comments/1qzcgmm/pros_and_cons_of_disabling_hyperv_and/ | 5-15% CPU uplift in CPU-limited scenarios; main culprit is Memory Integrity | 2026-02 |
| 17 | https://blog.kartones.net/post/additional-windows-11-and-bios-gaming-related-optimizations/ | Hyper-V runs in background consuming resources; disable for gaming PCs | 2025-11-05 |

---

### 4. Fullscreen Optimization (FSO) vs Exclusive Fullscreen

**Confidence: HIGH**

Windows 11's Fullscreen Optimizations (FSO) force games into a "hybrid" borderless mode that goes through the Desktop Window Manager (DWM) compositor, even when the game requests exclusive fullscreen. This was designed for better alt-tab behavior and overlay compatibility but adds variable latency.

- **Latency difference:** Exclusive fullscreen reduces input lag by 4-12ms vs borderless/FSO (IQON Digital)
- **Controlled testing with 8K Hz mouse:** ~2-3ms average added latency in borderless windowed vs exclusive fullscreen (Attack Shark)
- **For competitive gaming:** Disable FSO (right-click .exe > Compatibility > "Disable fullscreen optimizations") for true exclusive fullscreen with lowest latency
- **For casual/single-player:** FSO/borderless is fine; the 1-3ms difference is imperceptible
- **"Optimizations for windowed games"** (introduced in recent Win11 builds): Closes the historical gap by transitioning older DirectX 10/11 "blt-model" games to modern "flip-model" presentation, bypassing DWM -- effectively giving borderless games near-exclusive-fullscreen performance
- **Important caveat from XbitLabs:** Many users disable FSO thinking it will help, but their games never actually enter true exclusive fullscreen. Verify by checking if alt-tab is instant (= still composited) vs causes screen flash (= true exclusive)

Microsoft's DirectX blog (2019) confirmed that FSO is their path forward and true exclusive fullscreen is being deprecated in favor of the compositor-optimized path.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 18 | https://iqondigital.com/learn/pc-optimization/fullscreen-vs-windowed | Exclusive fullscreen reduces latency by 4-12ms vs composited modes | 2025 |
| 19 | https://attackshark.com/blogs/knowledges/fullscreen-windowed-input-sync-guide | Controlled test: 2-3ms added variable latency in borderless vs exclusive | 2025-12-27 |
| 20 | https://devblogs.microsoft.com/directx/demystifying-full-screen-optimizations/ | Microsoft's official explanation of FSO; flip-model vs blt-model presentation | 2019-12-17 |
| 21 | https://www.xbitlabs.com/blog/exclusive-fullscreen-vs-fullscreen/ | Many games never actually enter exclusive fullscreen even with FSO disabled | 2025 |
| 22 | https://windowsforum.com/threads/top-windows-11-gaming-tweaks-to-boost-performance-and-reduce-lag-in-2025.368700/ | "Optimizations for windowed games" closes gap with exclusive fullscreen | 2025 |
| 23 | https://www.windowscentral.com/microsoft/windows-11/my-top-21-ways-to-improve-windows-11-to-increase-gaming-performance-without-hardware-upgrade | Windowed optimization transitions older DX10/11 games to flip-model | 2025 |

---

### 5. Game Mode

**Confidence: HIGH**

Game Mode in Windows 11 has evolved significantly from its early, problematic iterations. The current consensus is clear: leave it ON.

- **What it does:** Prioritizes foreground game processes, reduces background task CPU allocation, prevents Windows Update from installing drivers or sending restart notifications during gameplay
- **FPS impact:** Minimal average FPS gain (0-3% typical), but the real benefit is improved frame pacing and fewer stutter spikes
- **CPU-intensive games:** 5-15% frame rate improvements reported in strategy/simulation titles (Kingfisher Computers)
- **Streaming caveat:** OBS users may experience choppy stream output with Game Mode enabled (confirmed Reddit reports)
- **2026 iteration:** Microsoft is evolving Game Mode toward better frame pacing rather than raw FPS gains
- **Reddit consensus (221 upvotes):** "There's no gain in turning it off. There is a gain in leaving it enabled."

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 24 | https://www.reddit.com/r/Windows11/comments/1pfmy0v/game_mode_in_win11_worth_it/ | "No gain turning it off; gain leaving it enabled" -- 221 upvotes | 2025-12-06 |
| 25 | https://www.maximumpcguides.com/windows-11-game-mode-on-or-off/ | Tested: hardware upgrade needed for >15-20% gains; Game Mode is modest but real | 2026-01-18 |
| 26 | https://xboxplay.games/windows-11/windows-11-game-mode-does-it-actually-improve-fps-in-2026-70474 | 2026 Game Mode primarily improves frame pacing, not raw FPS | 2026 |
| 27 | https://www.kingfishercomputers.co.uk/game-mode-in-windows-11/ | 5-15% improvement in CPU-intensive strategy/simulation games | 2025 |
| 28 | https://iqondigital.com/learn/pc-optimization/game-mode | Game Bar uses 200-400MB RAM; Game Mode itself is lightweight | 2026 |

---

### 6. Timer Resolution

**Confidence: MEDIUM** -- Measurable but highly hardware-dependent; conflicting advice on optimal method.

Windows 11 changed timer resolution behavior from Windows 10: it is now per-process rather than global (can be reverted via registry). The default timer resolution is 15.625ms, which is too coarse for competitive gaming.

- **Forcing 0.5ms timer resolution** improves frame pacing and input responsiveness in many games
- **Windows 11 vs 10 change:** Timer resolution is no longer global by default; `HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel\GlobalTimerResolutionRequests` (DWORD=1) restores global behavior
- **ISLC** can set timer resolution to 0.5ms automatically alongside standby list cleaning
- **XbitLabs testing:** Micro-adjusting timer resolution (testing values near 0.5ms) can improve precision; the "best" value is hardware-specific
- **BCDEdit commands commonly used:**
  - `bcdedit /set useplatformtick yes` -- forces RTC instead of HPET
  - `bcdedit /set disabledynamictick yes` -- prevents Windows from dynamically adjusting tick
  - `bcdedit /deletevalue useplatformclock` -- disables HPET, forces TSC
- **Caution:** Disabling HPET lowers latency on SOME boards but not all. Always benchmark before/after.
- **Modern recommendation:** Use TSC (CPU timestamp counter) as primary clock source, not HPET. Enable HPET in BIOS but let OS use TSC via bcdedit.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 29 | https://www.techbloat.com/does-timer-resolution-work-on-windows-11.html | Timer resolution works on Win11 but behavior changed to per-process | 2025-03-02 |
| 30 | https://xbitlabs.com/testing-micro-adjusting-the-timer-resolution-for-higher-precision | Micro-adjusting timer values improves precision over default 0.5ms | 2025 |
| 31 | https://www.xbitlabs.com/how-to-get-better-latency-in-windows/ | Disabling HPET + forcing TSC improves latency; hardware-dependent | 2025 |
| 32 | https://www.xbitlabs.com/hpet-settings/ | TSC+TSC (HPET on in BIOS, disabled via bcdedit) best for 4K-8K Hz mice | 2025 |
| 33 | https://timerresolution.com/ | Disabling HPET via bcdedit + 0.5ms tick lowers latency on some boards | 2025 |

---

### 7. Standby Memory List (ISLC)

**Confidence: MEDIUM** -- Useful in specific scenarios but largely unnecessary on modern systems with adequate RAM.

- **16GB+ RAM systems:** ISLC is generally unnecessary; Windows 11's memory manager handles standby list well
- **8GB or less:** ISLC can still help prevent stutters and crashes from memory pressure
- **Use case:** Extended gaming sessions where poorly optimized games accumulate standby memory without releasing it (e.g., Gray Zone Warfare)
- **ISLC also sets timer resolution** to 0.5ms, providing a secondary benefit
- **Windows 11 improvement:** Microsoft refined memory management algorithms; standby list pressure is less common than Win10 era
- **Recommended settings (16GB):** List size threshold 8192MB, free memory threshold 1024MB

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 34 | https://www.makeuseof.com/islc-fixed-my-game-crashes/ | ISLC fixed game crashes in extended sessions (Gray Zone Warfare example) | 2026-01-21 |
| 35 | https://www.makeuseof.com/islc-ram-tool-from-the-ddu-developer-is-surprisingly-useful/ | DDU developer's RAM tool; effective for systems with memory pressure | 2026-01-07 |
| 36 | https://joltfly.com/intelligent-standby-list-cleaner-settings-guide-max-fps/ | Detailed ISLC settings guide with per-RAM-size calculations | 2025-12-20 |
| 37 | https://www.elevenforum.com/t/is-it-worth-it-clearing-standby-list.38462/ | Community debate: useful for 8GB systems, unnecessary for 32GB+ | 2025-08-02 |
| 38 | https://forgeary.com/intelligent-standby-list-cleaner/ | ISLC comprehensive configuration guide; portable, no install required | 2025-04-28 |

---

### 8. Nagle's Algorithm

**Confidence: MEDIUM** -- The registry tweak works as documented, but real-world impact is modest and game-dependent.

Nagle's Algorithm bundles small TCP packets to improve bandwidth efficiency, adding 5-15ms latency. Disabling it via registry is a standard competitive gaming optimization.

- **How to disable:** Set `TCPNoDelay=1` and `TcpAckFrequency=1` (DWORD) under the correct network interface in `HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\{GUID}`
- **Expected benefit:** 5-15ms latency reduction for games using TCP (most MMOs, some competitive titles)
- **Caveat:** Many modern games use UDP, not TCP, making this tweak irrelevant for those titles
- **Caveat:** Some games already set TCP_NODELAY at the application level, overriding the system setting
- **Trade-off:** Slightly increased CPU load and network overhead; negligible on modern hardware
- **Recommendation:** Apply for online competitive gaming, revert for general use if needed

One source (wintweaks.pro) claims "up to 50% latency reduction in MMOs" which appears inflated and is not corroborated.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 39 | https://hone.gg/blog/optimize-windows-11-for-gaming/ | Nagle's Algorithm adds 5-15ms latency; disable via registry | 2025-07-25 |
| 40 | https://www.howtogeek.com/these-windows-settings-are-hurting-your-game-fps/ | Nagle's is one of "3 Windows settings hurting your FPS" | 2025-01-12 |
| 41 | https://gameloophub.com/system-optimization/disabling-nagles-algorithm-and-tcp-delays-via-windows-registry/ | Step-by-step guide; TCPNoDelay + TcpAckFrequency | 2025-06-20 |
| 42 | https://www.wintweaks.pro/en/nagle-algorithm/ | Claims up to 50% latency reduction in MMOs (likely inflated) | 2025 |
| 43 | https://windowsforum.com/threads/unlocking-gaming-performance-optimize-windows-11-settings.349334/ | Covers Nagle alongside HVCI and Hyper-V; holistic optimization guide | 2025-01-12 |

---

### 9. MMCSS (Multimedia Class Scheduler Service) Registry Tweaks

**Confidence: LOW-MEDIUM** -- These tweaks are widely circulated but their real-world impact on modern Windows 11 is debatable.

MMCSS registry tweaks (SystemResponsiveness, NetworkThrottlingIndex, Games task priority) have been a staple of Windows gaming optimization guides for over a decade. Their relevance on modern Windows 11 is diminishing.

- **SystemResponsiveness** (default 20): Reserves CPU % for background tasks. Setting to 10 gives games more CPU headroom but starves background tasks. A value of 0 is treated as 20.
- **NetworkThrottlingIndex** (set to 0xFFFFFFFF): Disables MMCSS-based network throttling. Widely applied, low risk.
- **Games task priority/scheduling:** Path `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games` -- set Scheduling Category to "High", GPU Priority to 8, Priority to 6.
- **Modern assessment:** Microsoft's scheduler has improved significantly in Windows 11. Some experts call these tweaks "old memes." The audio thread is the primary beneficiary of MMCSS boosting, not game threads.
- **Overclock.net research (djdallmann):** Detailed reverse-engineering of MMCSS behavior; confirmed it primarily affects threads that register with the service, and many games do not explicitly register.
- **Consensus:** Low risk to apply but don't expect dramatic improvements. Benchmark before/after.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 44 | https://learn.microsoft.com/en-us/windows/win32/procthread/multimedia-class-scheduler-service | Official Microsoft MMCSS documentation | evergreen |
| 45 | https://www.overclock.net/threads/research-on-multimedia-class-scheduler-service-mmcss.1774590/ | Detailed MMCSS reverse-engineering; shows actual scheduler behavior | 2025-01-14 |
| 46 | https://windowsforum.com/threads/windows-11-gaming-tuning-guide-2026-safe-consistent-performance.401517/ | 2026 tuning guide covering MMCSS alongside safe tweaks | 2026-02-17 |
| 47 | https://www.perfgamer.com/advanced-windows-11-tweaks-bios-and-registry-hacks-for-gaming-performance/ | BIOS + registry hacks including MMCSS for gaming | 2025 |
| 48 | https://www.xda-developers.com/5-windows-registry-tweaks-i-still-use-even-in-2025/ | Registry tweaks "still used in 2025" including MMCSS-related | 2025 |

---

### 10. General Optimization (Debloating, Power Plans, HAGS, Drivers)

**Confidence: HIGH** -- These are well-established, low-risk optimizations.

Several additional optimizations are consistently recommended across sources:

- **Debloating:** Use Win11Debloat PowerShell script or Tiny11 ISO to remove OneDrive, Teams, Copilot, etc. Reduces background CPU/RAM usage.
- **Power Plan:** Set to High Performance or Ultimate Performance. Prevents CPU downclocking.
- **Hardware-Accelerated GPU Scheduling (HAGS):** Enable in Settings > Display > Graphics. Reduces CPU overhead but increases VRAM usage.
- **GPU Drivers:** Always use clean installs (DDU + fresh driver). Intel Arc on 24H2 got WHQL driver with up to 6% FPS uplift.
- **Background apps:** Disable unnecessary startup apps, cloud sync, and launchers.
- **Windows Update:** Can cause performance regressions; test after each update.

**Sources:**
| # | URL | Key Finding | Date |
|---|-----|-------------|------|
| 49 | https://www.xda-developers.com/cardinal-rules-setting-up-new-gaming-pc/ | 5 rules: BIOS settings, debloat, drivers, backups, fan curves | 2026-02-23 |
| 50 | https://rigpod.com/windows-11-gaming-optimization-settings/ | Complete settings guide from months of testing on RTX 4070 Ti | 2026-01-14 |
| 51 | https://moderngamer.com/optimizing-windows-11-for-ultimate-pc-gaming-speed/ | Comprehensive guide: power plans, HVCI toggle, GPU drivers, VRR | 2025-12/2026-02 |
| 52 | https://www.makeuseof.com/stopped-paying-lag-reduction-apps-after-changing-these-windows-11-settings/ | "Optimizations for windowed games" notably lowers DX11/12 latency | 2025 |

---

## CONTRADICTIONS BETWEEN SOURCES

1. **VBS/HVCI FPS impact range:** Sources report anywhere from 4% (Tom's Hardware, conservative) to 28% (GameHazards, extreme). The variance depends heavily on CPU generation (MBEC support), whether the test is CPU-bound or GPU-bound, and specific game engine. The most reliable consensus is **4-10% average, up to 15% in CPU-bound titles.**

2. **Nagle's Algorithm impact:** Hone.gg claims 5-15ms reduction; wintweaks.pro claims "up to 50% latency reduction in MMOs." The 50% figure is not corroborated and appears inflated. Real-world benefit depends entirely on whether the game uses TCP and whether it already sets TCP_NODELAY.

3. **Fullscreen Optimizations:** XbitLabs warns that disabling FSO often does nothing because many modern DX12 games never use true exclusive fullscreen anyway. This contradicts guides that recommend disabling FSO as a universal tweak. The truth: it matters mainly for older DX10/DX11 titles.

4. **Timer Resolution:** Some sources recommend disabling HPET universally; XbitLabs notes it only helps on "some boards." The TSC vs HPET vs RTC choice is highly hardware-specific. No universal best configuration exists.

5. **MMCSS tweaks:** The community is split between "essential tweak" and "old meme." The Overclock.net research suggests MMCSS primarily benefits audio threads, not general game threads, undermining the common advice.

---

## GAPS IDENTIFIED FOR FURTHER RESEARCH

1. **Build 26200 specific changes:** No sources provided granular changelog analysis of gaming-relevant changes between specific 26200.x builds. The KB5077241 update (2026-02-25) focused on BitLocker/Sysmon, not gaming.

2. **Quantified Hyper-V overhead in isolation:** Most benchmarks test VBS+HVCI+Hyper-V together. Isolating the Hyper-V hypervisor overhead alone (without Memory Integrity) lacks controlled benchmarks.

3. **Windows 11 25H2 timer resolution behavior:** Whether the per-process timer resolution behavior has changed between 24H2 and 25H2 is not clearly documented.

4. **Game Mode 2026 internals:** Microsoft has not published technical documentation on what specifically changed in Game Mode's scheduling behavior in recent builds.

5. **DirectStorage real-world impact:** Consistently mentioned but no source provided concrete gaming benchmarks showing load-time improvements in actual games beyond Forspoken and Ratchet & Clank.

---

## PRIORITY-ORDERED OPTIMIZATION CHECKLIST

Based on impact magnitude and confidence level:

| Priority | Optimization | Expected Impact | Risk |
|----------|-------------|-----------------|------|
| 1 | Disable VBS + Memory Integrity | 4-15% FPS gain | Medium (reduced security) |
| 2 | Disable Hyper-V + VMP (if not using VMs) | 2-10% in CPU-bound scenarios | Low |
| 3 | Enable Game Mode | 0-5% + better frame pacing | None |
| 4 | Clean GPU driver install + latest drivers | 0-6% | Low |
| 5 | High Performance power plan | Prevents throttling | None |
| 6 | Disable fullscreen optimizations (competitive) | 2-12ms latency reduction | None |
| 7 | Enable HAGS | Reduces CPU overhead | Low |
| 8 | Debloat (Win11Debloat script) | Frees RAM/CPU | Low |
| 9 | Disable Nagle's Algorithm (online games) | 5-15ms latency reduction | Low |
| 10 | Timer resolution (0.5ms via ISLC or utility) | Better frame pacing | Low |
| 11 | ISLC standby list cleaning (8GB RAM or specific games) | Prevents stutter in edge cases | None |
| 12 | MMCSS registry tweaks | Marginal frame-time consistency | Low |
| 13 | BCDEdit timer tweaks (HPET/TSC) | Hardware-dependent latency | Medium (test carefully) |

---

## SEARCH EXECUTION NOTES

- **Brave Search:** 5 successful queries before rate limiting (Free AI plan, 1 req/sec)
- **Exa:** 8 successful semantic searches, excellent for finding recent guides and forum threads
- **Tavily:** All 6 queries returned HTTP 433 errors (likely quota/billing issue)
- **WebSearch (built-in):** 3 successful supplementary searches
- **Total unique sources cited:** 52 entries across all topic areas (many sources cover multiple topics)
- **Distinct unique domains:** 28+
