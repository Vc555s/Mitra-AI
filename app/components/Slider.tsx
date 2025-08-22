import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function valuetext(value: number) {
  return `${value}`;
}

export default function DiscreteSliderSteps() {
  return (
    <Box sx={{ width: 300}} >
      <Slider
        aria-label="Small steps"
        defaultValue={0}
        getAriaValueText={valuetext}
        step={1}
        marks
        min={1}
        max={5}
        valueLabelDisplay="auto"
        sx={{alignItems: 'center'}}
      />
    </Box>
  );
}
