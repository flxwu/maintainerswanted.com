import { h, Component } from 'preact';
import styled from 'styled-components';

import Icon from '../Icon';

class Info extends Component {
	constructor (props) {
		super(props);
		this.state = {
			stars: props.stars,
			contributors: props.contributors
		};
	}

	render (props) {
		
		return (
			<Container>
				<SubContainer>
					<Text>
						{props.stars}
					</Text>
					<Icon type={'star'} />
				</SubContainer>
				<SubContainer>
					<Text>
						{props.contributors}
					</Text>
					<Icon type={'users'} />
				</SubContainer>
			</Container>
		);
	}
}

const Container = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-self: flex-end;
	justify-content: flex-end;
	align-items: flex-end;
	padding: 0 4%;
`;

const SubContainer = styled.div`
	display: flex;
	flex: 1;
	justify-self: flex-end;
	justify-content: flex-end;
	align-items: center;
	margin: -10px 0;
`;

const Text = styled.p`
	display: flex;
	flex-basis: 0;
	font-family: Verdana;
	margin-right: 5px;
	padding-top: 5px;
	font-style: italic;
	font-weight: 500;
	font-size: 25px;
`;

export default Info;