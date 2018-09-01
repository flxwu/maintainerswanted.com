import { h, Component } from 'preact';
import styled from 'styled-components';
import MediaQuery from 'react-responsive';

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
			<div>
				<MediaQuery minDeviceWidth={1224}>
					<Container>
						<SubContainer>
							<Text>
								{props.stars}
							</Text>
							<Icon type={'star'} alt="Stars" title="Stars" />
						</SubContainer>
						<SubContainer>
							<Text>
								{props.contributors}
							</Text>
							<Icon type={'users'} alt="Contributors" title="Contributors" />
						</SubContainer>
					</Container>
				</MediaQuery>
				<MediaQuery maxDeviceWidth={1224}>
					<Container mobile>
						<SubContainer mobile>
							<Text mobile>
								{props.stars}
							</Text>
							<Icon type={'star'} width={30} alt="Stars" title="Stars" />
						</SubContainer>
						<SubContainer mobile>
							<Text mobile>
								{props.contributors}
							</Text>
							<Icon type={'users'} width={30} alt="Contributors" title="Contributors" />
						</SubContainer>
					</Container>
				</MediaQuery>
			</div>
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
	flex-direction: ${props => props.mobile ? 'row' : 'column'}
`;

const SubContainer = styled.div`
	display: flex;
	flex: 1;
	justify-self: flex-end;
	justify-content: flex-end;
	align-items: center;
	margin: ${props => props.mobile ? '0 10px' : '-10px 0'};
`;

const Text = styled.p`
	display: flex;
	flex-basis: 0;
	font-family: Verdana;
	margin-right: 10px;
	padding-top: 5px;
	font-style: italic;
	font-weight: 500;
	font-size: ${props => props.mobile ? '13px' : '25px'}
`;

export default Info;