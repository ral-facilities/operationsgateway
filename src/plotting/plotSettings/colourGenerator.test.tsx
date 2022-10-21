import ColourGenerator, { COLOUR_ORDER } from './colourGenerator';

describe('ColourGenerator', () => {
  let colourGenerator;

  beforeEach(() => {
    colourGenerator = new ColourGenerator();
  });

  describe('getting next colour', () => {
    it('returns the next colour in the remaining colours list', () => {
      const colour = colourGenerator.nextColour();
      expect(colour).toEqual(COLOUR_ORDER[0]);
    });

    it('returns a random colour if the list of remaining colours is empty', () => {
      COLOUR_ORDER.forEach(() => {
        colourGenerator.nextColour();
      });
      const colour = colourGenerator.nextColour();
      expect(COLOUR_ORDER.includes(colour)).toBeFalsy();
    });
  });

  describe('removing a colour', () => {
    it('1 colour selected', () => {
      const firstGenerated = colourGenerator.nextColour();

      colourGenerator.removeColour(firstGenerated);

      const secondGenerated = colourGenerator.nextColour();
      expect(firstGenerated).toEqual(secondGenerated);
    });

    describe('2 colours selected', () => {
      it('removes first', () => {
        const firstGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(firstGenerated);

        const thirdGenerated = colourGenerator.nextColour();
        expect(thirdGenerated).toEqual(firstGenerated);
      });

      it('removes second', () => {
        colourGenerator.nextColour();
        const secondGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(secondGenerated);

        const thirdGenerated = colourGenerator.nextColour();
        expect(thirdGenerated).toEqual(secondGenerated);
      });
    });

    describe('3 colours selected', () => {
      it('removes first', () => {
        const firstGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(firstGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(firstGenerated);
      });

      it('removes middle', () => {
        colourGenerator.nextColour();
        const secondGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(secondGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(secondGenerated);
      });

      it('removes last', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const thirdGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(thirdGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(thirdGenerated);
      });
    });

    describe('10 colours selected', () => {
      it('removes first', () => {
        const firstGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(firstGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(firstGenerated);
      });

      it('removes some middle ones', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const thirdGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        const fifthGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const ninthGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();

        // Remove third, then ninth, then fifth
        colourGenerator.removeColour(thirdGenerated);
        colourGenerator.removeColour(ninthGenerated);
        colourGenerator.removeColour(fifthGenerated);

        const eleventhGenerated = colourGenerator.nextColour();
        const twelfthGenerated = colourGenerator.nextColour();
        const thirteenthGenerated = colourGenerator.nextColour();
        expect(eleventhGenerated).toEqual(thirdGenerated);
        expect(twelfthGenerated).toEqual(fifthGenerated);
        expect(thirteenthGenerated).toEqual(ninthGenerated);
      });

      it('removes last', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const tenthGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(tenthGenerated);

        const eleventhGenerated = colourGenerator.nextColour();
        expect(eleventhGenerated).toEqual(tenthGenerated);
      });
    });

    describe('11 colours selected', () => {
      it('removes last', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const eleventhGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(eleventhGenerated);

        // No more colours in remaining colours list, so we expect a random colour
        const twelfthGenerated = colourGenerator.nextColour();
        expect(twelfthGenerated).not.toEqual(eleventhGenerated);
      });
    });
  });
});
