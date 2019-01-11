## Tera proxy module for logging boss interactions.

---

## Command
- Type `/8 logboss` to enable or disable boss skill logger.
- Type `/8 writelog` to enable or disable log writing function.
- Type `/8 logabnormal` to enable or disable abnormality logger.
- Type `/8 logmessage` to enable or disable dungeon message logger.
- Type `/8 createlog` to create an log file located in the modules sub folder.
    - Needs writelog and logabnormal or logmessage or logboss to be enabled.

---

## Note
- If you are using proxy in gui mode you can additionally set up template id whitelist.
	- If you want to log more bosses than the default ones.
- If you are using proxy in gui mode you can additionally set up abnormal id blacklist.
	- If you don't want to log some abnormalities.
- Everything is disabled by default don't forget to untick boxes after logging is done.
	- Deactivate via command if not in gui mode.
- Everytime you log out and in and createlog was activated before a new log is created.
- If you got writlog and some logging stuff enabled without createlog mod throws error.