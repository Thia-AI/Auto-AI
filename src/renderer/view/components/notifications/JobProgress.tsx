import React, { useEffect, useState } from 'react';

import { Box, HStack, Progress, Spacer, Text } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { Job, nullJob } from '../../helpers/constants/engineDBTypes';
import { EngineActionHandler } from '_/renderer/engine-requests/engineActionHandler';

interface Props {
	jobID?: string;
	clearJobIDState: () => void;
	initialJob: Job;
}

const JobProgressC = React.memo((props: Props) => {
	const { jobID, clearJobIDState, initialJob } = props;

	const intervalTime = 750;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [intervalID, setIntervalID] = useState<any>();
	const [job, setJob] = useState<Job>(nullJob);

	console.log(job);

	// We set here so that it displays the proper job name and progress
	// even before the first setInterval() has ran below
	useEffect(() => {
		setJob(initialJob);
	}, []);

	useEffect(() => {
		// Clear interval if jobID doesn't exist (when it finishes or hasn't started).
		// Or start function running every interval time that updates job status
		if (!jobID) {
			setJob(nullJob);
			clearInterval(intervalID);
		} else {
			setIntervalID(
				setInterval(async () => {
					const [err, resData] = await EngineActionHandler.getInstance().getJob(jobID, {
						timeout: intervalTime - 100,
					});

					if (!err) {
						const resDataJob = resData as Job;
						if (resDataJob.has_finished) {
							clearJobIDState();
							return;
						}
						setJob(resDataJob);
					}
				}, intervalTime),
			);
		}
	}, [jobID]);

	const render = () => {
		if (!jobID) return <></>;
		else
			return (
				<Box w='full' rounded='md' bg='gray.750' marginBottom='3' px='4' py='2'>
					<HStack w='full'>
						<Text fontSize='sm' color='gray.500' as='h6'>
							{job.job_name}
						</Text>
						<Spacer />
						<Text fontSize='sm' color='gray.600' as='p' pr='2'>
							{job.progress}/{job.progress_max}
						</Text>
					</HStack>
					<Progress
						transition='all 250ms ease'
						borderRadius='sm'
						my='2'
						w='full'
						colorScheme='green'
						min={0}
						max={job.progress_max}
						value={job.progress}
						size='sm'
					/>
				</Box>
			);
	};
	return render();
});

export const JobProgress = connect()(JobProgressC);
