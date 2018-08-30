import { h } from 'preact';
import styled from 'styled-components';

const Header = props =>	(
	<Container>
		<Title>Looking for Maintainers</Title>
	</Container>
);

const Container = styled.header`
	background-size: 100% 100%;
`;

const Title = styled.h1`
	font-style: italic;
	text-align: center;
`;

export default Header;