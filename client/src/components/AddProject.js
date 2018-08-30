import { h, Component } from 'preact';
import styled from 'styled-components';

class AddProject extends Component {
	constructor () {
	}

	render (props) {

		return (
			<Form>
				<TextField>

				</TextField>
        <TextField>

				</TextField>
			</Form>
		);
	}
}

const Form = styled.div`
	display: block;
  margin-top: 30%;
`;

export default AddProject;
