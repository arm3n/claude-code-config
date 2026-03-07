# Async Trading System Coding Rules

> Derived from Kalshi weather bot bugs (2026-03-06). Validated by Gemini Pro.
> Apply these whenever writing/reviewing async Python for financial exchanges.

## 1. Pessimistic Yield Accounting
Every `await` suspends execution while WebSocket callbacks can fire.
- Book worst-case state BEFORE the `await` (e.g., `register_pending` before `create_order`)
- Resolve to actual state AFTER it returns (e.g., confirm order_id)
- Roll back on failure (`reduce_pending` in except block)
- Never place state registration after an `await` — fills can arrive during the yield

## 2. Event-Driven Risk Response
If a condition can be breached by an async event (WS fill), the mitigation MUST fire in that event's callback — not deferred to a polling loop.
- Use callbacks or `asyncio.ensure_future()` from the event handler
- Don't rely on `asyncio.sleep()` polling to detect state changes from push events
- Example: risk shutdown triggered by fill must cancel orders immediately, not wait 15s for quote loop

## 3. Fail-Hard on Blind State
A crashed bot is safer than a blind bot trading with wrong assumptions.
- Never `except: log.error()` during bootstrap, position sync, or risk-state resolution
- If you can't guarantee state accuracy after an exception, `sys.exit(1)`
- On systemd, exit triggers restart which retries — this is correct behavior

## 4. Timeouts Are Unknown States
A `TimeoutError` on order placement doesn't mean the order failed — it means you don't know.
- Catch `asyncio.TimeoutError` separately from generic exceptions
- Do NOT roll back pending on timeout (order may be live)
- Trigger REST reconciliation to detect zombie orders
- Never just `continue` after a timeout on an order operation

## 5. Centralized State Mutation
Don't scatter critical state transitions across multiple functions.
- Use a single `_trigger_shutdown(reason)` method instead of `self._shutdown = True` in 3 places
- Wire callbacks so responses (cancel orders) fire automatically from ANY trigger path
- Prevents "added shutdown trigger in function A but forgot to wire the response"
