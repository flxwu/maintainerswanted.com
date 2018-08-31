import { h, Component } from 'preact';
import styled from 'styled-components';

import Icon from '../Icon';

class NewProject extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collapsed: true
		};
	}

	render () {
		const { collapsed } = this.state;

		return (
			<Card collapsed={collapsed}>
				{collapsed ?
					<Form>
						Github Username: <TextBox />{"\n"}
						Repository Name: <TextBox />
					</Form>
					: <Icon type={'plus'} />
				}
			</Card>
		);
	}
}

const Card = styled.div`
	position: relative;
	background: #E27D60;
	padding: 0.5% 8%;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	line-height: 1.8;
	font-size: 18px;
	margin-bottom: 20px;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: space-around`
;

const Form = styled.form`

`;

const TextBox = styled.input`
	display: inline-flex;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	height: 20px;
	padding: 10px;
	margin: 20px;
	min-width: 70%;
	border: none;
`;

export default NewProject;
