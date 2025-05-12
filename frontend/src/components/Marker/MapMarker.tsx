// src/components/CustomButton.tsx
import React from 'react';
import { Button, KIND, SIZE, ButtonProps } from 'baseui/button';

type Props = ButtonProps & {
  label: string;
};

const CustomButton: React.FC<Props> = ({}) => {
  return (
    <div style={{ pointerEvents: 'auto' }}>
      <Button
        onClick={() => alert("click")}
        kind={KIND.secondary}
        size={SIZE.compact}
      >
        Make Marker!
      </Button>
    </div>
  );
};

export default CustomButton;