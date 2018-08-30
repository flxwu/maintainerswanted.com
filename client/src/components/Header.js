import { h } from 'preact';
import styled from 'styled-components';

const Header = props =>	(
	<Container>
		<Title>Looking for Maintainers</Title>
		<Text>
			Find projects that are searching for maintainers
		</Text>
	</Container>
);

const Container = styled.header`
	background-size: 100% 100%;
	margin-top: 50px;
	flex: 1;
	align-items: center;
	justify-content: center;
`;

const Title = styled.h1`
	font-style: italic;
	text-align: center;
	font-family: Courier New;
	flex: 1;
`;

const Text = styled.p`
	font-family: Verdana;
	line-height: 1.8;
	flex: 1;
	text-align: center;
`;

export default Header;