import { h, Component } from 'preact';
import styled from 'styled-components';

class ProjectCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			project: props.project
		};
	}
	
	render () {
		const { name, description, github } = this.state.project;

		return (
			<Card>
				<Title>{name}</Title>
			</Card>
		);
	}
}

const Card = styled.div`
	position: relative;
	background: #fff;
	padding: 3% 5%;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	line-height: 1.8;
	font-size: 18px;
	margin-bottom: 20px;
	height: 10rem;
	overflow: hidden;`
;

const Title = styled.h2`
	text-decoration: underline;
`;

export default ProjectCard;