// List of colours to generate in order (taken from eCat)
export const COLOUR_ORDER: string[] = [
  '#008000', // dark green
  '#0000ff', // dark blue
  '#ff00ff', // pink
  '#00ffff', // light blue
  '#008080', // teal
  '#800000', // deep red
  '#00ff00', // light green
  '#000080', // navy blue
  '#7f8000', // brown-ish yellow?
  '#80007f', // indigo
];

/**
 * Handles the colours currently in use for plotting different channels
 * Determines which colours we have available based on which have already been selected
 * Uses a list of 10 pre-selected colours before generating a random colour beyond this
 */
class ColourGenerator {
  selectedColours: string[];
  remainingColours: string[];

  // We need to ensure deep copies here to prevent conflicts with other plot configs
  constructor(selectedColours?: string[], remainingColours?: string[]) {
    if (selectedColours) {
      this.selectedColours = selectedColours.map((colour) => colour);
    } else {
      this.selectedColours = [];
    }
    if (remainingColours) {
      this.remainingColours = remainingColours.map((colour) => colour);
    } else {
      this.remainingColours = COLOUR_ORDER.map((colour) => colour);
    }
  }

  getSelectedColours() {
    return this.selectedColours;
  }

  getRemainingColours() {
    return this.remainingColours;
  }

  /**
   * Generates a random hex colour
   * Called when we have no remaining pre-selected colours to return
   * @returns a random hex colour value
   */
  randomColour() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Provides the next colour in the list of remaining colours
   * @returns the colour to display
   */
  nextColour() {
    if (!this.remainingColours.length) return this.randomColour();

    const returningColour =
      this.remainingColours.shift() ?? this.randomColour(); // .shift() should always return a value but the compiler wasn't satisfied without a way out of returning undefined
    this.selectedColours.push(returningColour); // Add the next colour to the list of selected colours
    return returningColour;
  }

  /**
   * Handles removing a colour from the list of selected colours
   * The removed colour is inserted back into its original place in the remaining colours list
   * This ensures the colour at position *n* is always the *n*th colour returned
   * @param removedColour the colour to remove
   */
  removeColour(removedColour: string) {
    const selectedIndex = this.selectedColours.indexOf(removedColour);
    if (selectedIndex === -1) return;

    // Modify the selectedColours list to keep the other colours
    this.selectedColours.splice(selectedIndex, 1);

    // See if the removed colour is in the list of pre-determined colours
    const indexOfRemoved = COLOUR_ORDER.indexOf(removedColour);
    if (indexOfRemoved !== -1) {
      let inserted = false;

      // Loop through the remaining colours
      for (let i = 0; i < this.remainingColours.length; i++) {
        const currentRemainingColour = this.remainingColours[i];
        const indexOfCurrent = COLOUR_ORDER.indexOf(currentRemainingColour);

        // If the current remaining colour appears after the colour to be removed
        if (indexOfCurrent > indexOfRemoved) {
          // Insert the colour to be removed before the current remaining colour
          this.remainingColours.splice(i, 0, removedColour);
          inserted = true;
          break;
        }
      }

      // Removed colour was the last pre-determined colour so add it to the end of remaining colours list
      if (!inserted) this.remainingColours.push(removedColour);
    }
  }
}

export default ColourGenerator;
