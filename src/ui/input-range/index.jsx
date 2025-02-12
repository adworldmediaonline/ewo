'use client';
import { getTrackBackground, Range } from 'react-range';

const InputRange = ({ STEP, MIN, MAX, values, handleChanges }) => {
  return (
    <>
      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={vals => handleChanges(vals)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            key={props.key}
            style={{
              ...props.style,
              height: '3px',
              width: '100%',
              background: getTrackBackground({
                values: values,
                colors: ['#EDEDED', '#07215e', '#EDEDED'],
                min: MIN,
                max: MAX,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            key={props.key}
            style={{
              ...props.style,
              height: '17px',
              width: '5px',
              backgroundColor: '#07215e',
              backgroundColor: isDragged ? '#07215e' : '#07215e',
            }}
          />
        )}
      />
    </>
  );
};

export default InputRange;
