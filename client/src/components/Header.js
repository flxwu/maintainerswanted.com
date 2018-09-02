import { h } from 'preact';
import styled from 'styled-components';
import axios from 'axios';

const logOut = async () => {
	await axios.get('/api/auth/github/logout');
};

const Header = props => (
	<Container>
		{props.loggedIn && (
			<LoggedIn>
				<Login>
				Logged in as:
					<Link href={`https://github.com/${props.user}`} target="_blank">{props.user}</Link>
				</Login>
				<Logout onClick={logOut}>
					Log out
				</Logout>
			</LoggedIn>
		)}
		<Title>Maintainers Wanted</Title>
		<Text>
			Find projects that are searching for Maintainers or <br />
			Find maintainers to overtake your project!
		</Text>
	</Container>
);

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

const Logout = styled.div`
	display: flex;
	align-self: flex-end;
	cursor: pointer;
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
