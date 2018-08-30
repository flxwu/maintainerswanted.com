import { h, Component } from 'preact';
import styled from 'styled-components';

import ProjectCard from './project/ProjectCard';
import Header from './Header';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: [{
				name: '30secondsofcode',
				description: 'A curated collection of JS snippets',
				link: 'https://github.com/Chalarangelo/30-seconds-of-code/',
				githubInfo: {
					stars: 3000,
					contributors: 5
				}
			}
			]
		};
	}

	render() {
		const { projects } = this.state;

		return (
			<div>
				<Header />
				<List>
					{projects.map(project => (
						<ProjectCardWrapper>
							<ProjectCard project={project} githubInfo={project.githubInfo} />
						</ProjectCardWrapper>)
					)}
				</List>
				<FooterWrapper>
					<Footer>
						Made with love by @flxwu
					</Footer>
				</FooterWrapper>
			</div>
		);
	}
}

const List = styled.ul`
	display: block;
	margin-block-start: 3em;
	margin-block-end: 1em;
	margin-inline-start: 0px;
	margin-inline-end: 0px;
	padding-inline-start: 170px;
	padding-inline-end: 170px;
	list-style-type: none;
	background: #FAFAFA;
	text-align: center;
`;

const FooterWrapper = styled.div`
	position: absolute; 
	left: 50%;
	background: #FAFAFA;
	bottom: 0;
	height: 20px;
`;

const Footer = styled.div`
	position: relative; 
	left: -50%;
`;

const ProjectCardWrapper = styled.li`
	position: relative;
	flex: 1;
`;
