import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { currentJob } from "../../redux/actions/job";
import { getEmployeesThunk } from "../../redux/thunks/employee";
import JobCard from "./JobCard";
import Checkbox from "../resusable-components/Checkbox";

import Job from "./Job";
import { Menu } from "../resusable-components/styledComponents";

class JobListContainer extends Component {
  state = {
    checkBoxPointer: true,
    followUp: false,
    all: false,
    filter: ""
  };

  followUpHandler = () => {
    this.setState({
      followUp: !this.state.followUp,
      all: false
    });
  };

  allHandler = () => {
    this.setState({
      followUp: false,
      all: !this.state.all
    });
  };

  transformJob = job => (
    <JobCard
      key={job._id}
      _id={job._id}
      company={job.company}
      status={job.status}
      date={job.mostRecentEmailSent}
    />
  );

  render() {
    // const jobs = this.props.jobs.map(job => (
    //   <JobCard
    //     key={job._id}
    //     _id={job._id}
    //     company={job.company}
    //     status={job.status}
    //     date={job.mostRecentEmailSent}
    //   />
    // ));

    const today = new Date();

    let followUpJobs = this.props.jobs
      .filter(j => j.mostRecentEmailSent !== null)
      .filter(j => {
        const lastEmail = new Date(j.mostRecentEmailSent);
        const diffTime = Math.abs(today - lastEmail);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
      })
      .filter(
        j =>
          j.status === "Waiting for email response" ||
          j.status === "Submitted application; waiting for company response"
      )
      .map(j => (
        <JobCard
          key={j._id}
          _id={j._id}
          company={j.company}
          status={j.status}
          date={j.mostRecentEmailSent}
        />
      ));

    const activeJobs = this.props.jobs
      .filter(j => j.status !== "Rejected")
      .map(j => (
        <JobCard
          key={j._id}
          _id={j._id}
          company={j.company}
          status={j.status}
          date={j.mostRecentEmailSent}
        />
      ));

    return (
      <Container>
        <Header>
          <TextContainer>
            <P>RECENT JOBS</P>

            <input
              type="text"
              value={this.state.filter}
              onChange={e => {
                this.setState({
                  filter: e.target.value.toLowerCase()
                });
              }}
            />

            <CheckFlex>
              {!this.state.all && (
                <Checkbox
                  text={"Follow Up?" + " (" + followUpJobs.length + ")"}
                  clickHandler={this.followUpHandler}
                  checked={this.state.followUp}
                />
              )}
              {!this.state.followUp && (
                <Checkbox
                  text={"All Jobs"}
                  clickHandler={this.allHandler}
                  checked={this.state.all}
                />
              )}
            </CheckFlex>
          </TextContainer>
        </Header>
        <JobGrid>
          {this.state.filter.length === 0 &&
            this.props.jobs
              .filter(j => j.status !== "Rejected")
              .map(j => this.transformJob(j))}
          {this.state.filter.length > 0 &&
            this.props.jobs
              .filter(j =>
                j.company.toLowerCase().startsWith(this.state.filter)
              )
              .map(j => this.transformJob(j))}
        </JobGrid>
      </Container>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    currentJob: job => dispatch(currentJob(job)),
    getEmployeesThunk: jobId => dispatch(getEmployeesThunk(jobId))
  };
};

export default connect(
  null,
  mapDispatchToProps
)(JobListContainer);

const Container = styled.div`
  max-width: 1170px;
  width: auto;
  margin: auto;
  background-color: white;
  height: 100px;
  border-radius: 8px;
`;

const Header = styled.div`
  height: 70px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border-bottom: 1px solid grey;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 30px;
  margin-right: 30px;
  padding-top: 10px;
  font-size: 20px;
  justify-content: space-between;
`;

const JobGrid = styled.div`
  padding: 20px;
  max-width: 1200px;
  background: white;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  margin-bottom: 30px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const CheckFlex = styled.div`
  display: flex;
  flex-direction: column;
`;

const P = styled.p`
  padding-top: 16px;
`;
