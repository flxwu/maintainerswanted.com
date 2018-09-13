import { h } from 'preact';
import styled from 'styled-components';
import axios from 'axios';

const rootURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://maintainerswanted.com';

const logOut = () => {
  axios
    .get('/api/auth/github/logout')
    .then(response => {
      window.location = rootURL;
    })
    .catch(err => console.error(err));
};

const Header = props => (
  <Container>
    {props.loggedIn && (
      <LoggedIn>
        <Login>
          Logged in as:
          <Link href={`https://github.com/${props.user}`} target='_blank'>
            {props.user}
          </Link>
        </Login>
        <div style={styles.logout} onClick={logOut}>
          Log out
        </div>
      </LoggedIn>
    )}
    <Title>Maintainers Wanted</Title>
    <Text>
      Find projects that are searching for Maintainers or <br />
      Find maintainers to overtake your project!
    </Text>
      <Link big href='https://www.producthunt.com/posts/maintainers-wanted' target='_blank'>
      Upvote us on ProductHunt!
      </Link>
  </Container>
);

const styles = {
  // FIXME: turn into styled-component
  // ugly fix for now
  // preact renders the styled-component as <undefined></undefined>
  logout: {
    alignSelf: 'flex-end',
    cursor: 'pointer',
    display: 'flex'
  }
};

const LoggedIn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-self: flex-end;
  font-family: Verdana;
  text-align: right;
  align-self: right;
  font-weight: 500;
  font-size: 12px;
  margin: -1% 10%;
`;

const Link = styled.a`
  font-style: italic;
  margin-left: 5px;
  text-decoration: none;
  font-weight: bold;
  color: #e27d60;
  ${props => props.big && 'font-size: 1.2rem; text-decoration: underline;'}
  &:hover {
    color: grey;
  }
`;

const Container = styled.header`
  background-size: 100% 100%;
  margin-top: 50px;
  flex: 1;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-style: italic;
  text-align: center;
  font-family: Courier New;
  flex: 1;
  margin: 10px;
  display: flex;
`;

const Login = styled.div`
  display: flex;
  font-weight: 700;
`;

const Text = styled.p`
  font-family: Verdana;
  line-height: 1.8;
  flex: 1;
  text-align: center;
  margin: 10px;
  display: flex;
`;

export default Header;
