const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Node = AeSDK.Node;

let network = {
	url: 'http://localhost:3001',
	internalUrl: 'http://localhost:3001/internal',
	networkId: "ae_devnet",
	compilerUrl: 'http://localhost:3080'
}

const keypair = {
	publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
	secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca'
}

describe('ToDoManager Contract', () => {

	let owner;
	let contractSource

	before(async () => {	
		let node = await Node({
			url: network.url,
			internalUrl: network.internalUrl,
			forceCompatibility: true
		})

		owner = await Universal({
			nodes: [{
				name: 'ANY_NAME',
				instance: node
			}],
			accounts: [AeSDK.MemoryAccount({
				keypair
			})],
			nativeMode: true,
			networkId: network.networkId,
			compilerUrl: network.compilerUrl,
			forceCompatibility: true
		});
	});

	it('Deploying ToDoManager Contract', async () => {
		contractSource = utils.readFileRelative('./contracts/ToDoManager.aes', "utf-8"); // Read the aes file
		const compiledContract = await owner.getContractInstance(contractSource);

		const deployPromise = compiledContract.deploy();

		assert.isFulfilled(deployPromise, 'Could not deploy the ToDoManager Smart Contract'); // Check it is deployed
	});

	describe('Interact with contract', () => {
		let deployedContract;
		let compiledContract;

		beforeEach(async () => {
			compiledContract = await owner.getContractInstance(contractSource);
			deployedContract = await compiledContract.deploy();
            console.log("DEPLOYED CONTRACT:", deployedContract);
		});

		describe('Contract functionality', () => {
			describe('Create a task', () => {
				it('should create a task successfully', async () => {
					//Arrange
					const taskName = 'Task A';

					//Act
					const addTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`
					});
					assert.isFulfilled(addTaskPromise, 'Could not call add_to_do');
					const taskCreationResult = await addTaskPromise;

					//Assert
					const taskCreationResultDecoded = await taskCreationResult.decode("string");
					assert.equal(taskCreationResultDecoded.value, taskName)
				});

			});

			describe('Get tasks count', () => {
				it('should get tasks count successfully', async () => {
					//Arrange
					const taskName = 'Task A';
					const secondTaskName = 'Task B';
					const expectedTasksCount = 2;

					//Add first task
					const addFirstTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`
					});
					assert.isFulfilled(addFirstTaskPromise, 'Could not call add_to_do');
					await addFirstTaskPromise;

					//Add second task
					const addSecondTaskPromise = deployedContract.call('add_to_do', {
						args: `("${secondTaskName}")`
					});
					assert.isFulfilled(addSecondTaskPromise, 'Could not call add_to_do');
					await addSecondTaskPromise;

					//Act
					const getTasksCountPromise = deployedContract.call('get_task_count', {
						args: `()`
					});
					assert.isFulfilled(getTasksCountPromise, 'Could not call add_to_do');
					const getTasksCountResult = await getTasksCountPromise;

					//Assert
					const getTasksCountResultDecoded = await getTasksCountResult.decode("int");

					assert.equal(getTasksCountResultDecoded.value, expectedTasksCount)
				});
			});

			describe('Complete tasks and check task status', () => {
				it('should complete a task successfully', async () => {
					const taskName = 'Task A';

					//Act
					const addTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`
					});
					assert.isFulfilled(addTaskPromise, 'Could not call add_to_do');
					await addTaskPromise;

					const completeTaskPromise = deployedContract.call('complete_task', {
						args: `(0)`
					});
					assert.isFulfilled(completeTaskPromise, 'Could not call complete_task');
					const completeTaskResult = await completeTaskPromise;

					//Assert
					const completeTaskResultDecoded = await completeTaskResult.decode("bool");
					assert.equal(completeTaskResultDecoded.value, true)
				});

				it('should get task status successfully', async () => {
					const taskName = 'Task A';

					// Add task
					const addTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`
					});
					assert.isFulfilled(addTaskPromise, 'Could not call add_to_do');
					await addTaskPromise;

					// Check status before
					const taskIsCompleteBeforePromise = deployedContract.call('task_is_completed', {
						args: `(0)`
					});
					assert.isFulfilled(taskIsCompleteBeforePromise, 'Could not call complete_task');
					const taskIsCompleteBeforeResult = await taskIsCompleteBeforePromise;

					//Assert
					const taskIsCompleteBeforeResultDecoded = await taskIsCompleteBeforeResult.decode("bool");
					assert.equal(taskIsCompleteBeforeResultDecoded.value, false);

					// Complete task
					const completeTaskPromise = deployedContract.call('complete_task', {
						args: `(0)`
					});
					assert.isFulfilled(completeTaskPromise, 'Could not call complete_task');
					const completeTaskResult = await completeTaskPromise;

					//Assert
					const completeTaskResultDecoded = await completeTaskResult.decode("bool");
					assert.equal(completeTaskResultDecoded.value, true)

					// Check status after
					const taskIsCompleteAfterPromise = deployedContract.call('task_is_completed', {
						args: `(0)`
					});
					assert.isFulfilled(taskIsCompleteAfterPromise, 'Could not call complete_task');
					const taskIsCompleteAfterResult = await taskIsCompleteAfterPromise;

					//Assert
					const taskIsCompleteAfterResultDecoded = await taskIsCompleteAfterResult.decode("bool");
					assert.equal(taskIsCompleteAfterResultDecoded.value, true);
				});
			});

			describe('Get task name by index', () => {
				it('should get task name by index successfully', async () => {
					//Arrange
					const taskName = 'Task A';
					const secondTaskName = 'Task B';
					const secondTaskIndex = 1;

					//Add first task
					const addFirstTaskPromise = deployedContract.call('add_to_do', {
						args: `("${taskName}")`
					});
					assert.isFulfilled(addFirstTaskPromise, 'Could not call add_to_do');
					await addFirstTaskPromise;

					//Add second task
					const addSecondTaskPromise = deployedContract.call('add_to_do', {
						args: `("${secondTaskName}")`
					});
					assert.isFulfilled(addSecondTaskPromise, 'Could not call add_to_do');
					await addSecondTaskPromise;

					// Get task name by index
					const getTaskNamePromise = deployedContract.call('get_task_by_index', {
						args: `(${secondTaskIndex})`
					});
					assert.isFulfilled(getTaskNamePromise, 'Could not call get_task_by_index');
					const getTaskNameResult = await getTaskNamePromise;

					//Assert
					const getTaskNameResultDecoded = await getTaskNameResult.decode("string");
					assert.equal(getTaskNameResultDecoded.value, secondTaskName);
				});

			})
		})
	});

});