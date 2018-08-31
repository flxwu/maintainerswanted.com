import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';

import Info from './Info';

class ProjectCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			project: props.project,
			stars: 0,
			watchers: 0,
			contributors: 0
		};
	}

	async componentDidMount() {
		const { project } = this.state;

		const url = `/api/project/getStatistics?owner=${project.owner}&repo=${project.name}`;
		// Get stars and contributors for single project
		const response = await axios.get(url);
		const data = response.data.data;
		this.setState({
			stars: data.stars,
			watchers: data.watchers,
			contributors: data.contributors
		});
	}
	
	render () {
		const { stars, contributors } = this.state;
		const { name, description, url } = this.state.project;

		return (
			<Card>
				<Meta>
					<Title>
						<Link href={url}>
							{name}
						</Link>
					</Title>
					<SubTitle>
						{description}
					</SubTitle>
				</Meta>
				<Info stars={stars} contributors={contributors} />
			</Card>
		);
	}
}

const Card = styled.div`
	position: relative;
	background: #fff;
	padding: 4% 8%;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	line-height: 1.8;
	font-size: 18px;
	margin-bottom: 20px;
	height: 10rem;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: space-around`
;

const Meta = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	flex-basis: 70%;
`;

const Title = styled.h2`
	display: flex;
	flex: 1;
	text-decoration: underline;
	font-family: Courier New;
	flex-basis: 0;
`;

const SubTitle = styled.h4`
	display: flex;
	text-decoration: none !important;
	flex: 1;
	font-family: Comic Sans MS;
	text-align: left;
`;

const Link = styled.a`
	display: flex;
	color: #E27D60;
	flex: 1;
	&:hover { 
		color: grey; 
	}
`;

export default ProjectCard;