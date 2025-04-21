import { replace } from 'react-router-dom';

const HideChild = () => {
  return null;
};

export const loader = () => {
  return replace('one');
};

export const handle = {
  hideInMenu: true
};

export default HideChild;
