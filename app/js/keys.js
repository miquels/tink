/*
 * keys.js	Map device-specific keys to generic values.
 *
 */

var Platform = require('./platform.js');

// See if we have samsung tv support.
var samsungKey = Platform.samsungKey;

// Return values.
var key = {
	Back:			8,
	Tab:			9,
	Enter:			13,
	Esc:			27,
	Space:			32,
	PageUp:			33,
	PageDown:		34,
	End:			35,
	Home:			36,
	Left:			37,
	Up:				38,
	Right:			39,
	Down:			40,
	Mute:			173,
	VolUp:			174,
	VolDown:		175,
	Red:			2048,
	Green:			2049,
	Yellow:			2050,
	Blue:			2051,
	FastForward:	2052,
	FastRewind:		2053,
	Forward:		2054,
	Rewind:			2055,
	Play:			2056,
	Stop:			2057,
	Pause:			2058,
};
exports.key = key;

exports.map = function(event, inkey) {

	inkey = inkey || event.which;

	// first map browser differences (firefox).
	switch (inkey) {
		case 181:
			return key.Mute;
		case 182:
			return key.VolUp;
		case 183:
			return key.VolDown;
	}

	// no samsung keys? done.
	if (samsungKey == null)
		return inkey;

	switch (inkey) {
		case samsungKey.KEY_RED:
			return key.Red;
		case samsungKey.KEY_GREEN:
			return key.Green;
		case samsungKey.KEY_YELLOW:
			return key.Yellow;
		case samsungKey.KEY_BLUE:
			return key.Blue;
		case samsungKey.KEY_RETURN:
		case samsungKey.KEY_PANEL_RETURN:
			event.preventDefault();
			return key.Back;
		case samsungKey.KEY_PLAY:
			return key.Play;
		case samsungKey.KEY_STOP:
			return key.Stop;
		case samsungKey.KEY_PAUSE:
			return key.Pause;
		case samsungKey.KEY_FF:
			return key.FastForward;
		case samsungKey.KEY_RW:
			return key.FastRewind;
		case samsungKey.KEY_VOL_UP:
		case samsungKey.KEY_PANEL_VOL_UP:
			return key.VolUp;
		case samsungKey.KEY_VOL_DOWN:
		case samsungKey.KEY_PANEL_VOL_DOWN:
			return key.VolDown;
		case samsungKey.KEY_DOWN:
			return key.Down;
		case samsungKey.KEY_UP:
			return key.Up;
		case samsungKey.KEY_LEFT:
			return key.Left;
		case samsungKey.KEY_RIGHT:
			return key.Right;
		case samsungKey.KEY_ENTER:
		case samsungKey.KEY_PANEL_ENTER:
			return key.Enter;
		case samsungKey.KEY_MUTE:
			return key.Mute;
	}
	return inkey;
}

