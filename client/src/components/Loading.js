import { h, Component } from 'preact';
import styled, { keyframes } from 'styled-components';

class Loading extends Component {
  render () {
    return (
      <DotWrapper>
        <Dot delay='0s' />
        <Dot delay='.1s' />
        <Dot delay='.2s' />
      </DotWrapper>
    );
  }
}

const DotWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
  height: 10px;
`;

const BounceAnimation = keyframes`
  0% { margin-bottom: 0; }
  50% { margin-bottom: 15px }
  100% { margin-bottom: 0 }
`;

const Dot = styled.div`
  background-color: black;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 0 5px;
  /* Animation */
  animation: ${BounceAnimation} 0.5s linear infinite;
  animation-delay: ${props => props.delay};
`;

export default Loading;
