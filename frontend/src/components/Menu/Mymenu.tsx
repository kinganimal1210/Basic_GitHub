// src/components/MyMenu.tsx
import * as React from 'react';
import { StatefulMenu, StyledList} from 'baseui/menu'; // StyledOption <- 사용안하므로 없앰.
import { Button, SIZE } from 'baseui/button';

const items = [
  { id: '1', label: 'Profile' },
  { id: '2', label: 'Settings' },
  { id: '3', label: 'Logout' },
];

const MyMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', pointerEvents: 'auto' }}>
      <Button onClick={() => setIsOpen(!isOpen)} kind ="secondary">
        Open
      </Button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 1,
          background: 'transparent', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          pointerEvents: 'auto',
        }}>
          <StatefulMenu
            items={items}
            onItemSelect={({ item }) => {
              console.log('selected', item);
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MyMenu;