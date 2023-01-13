import { useContext, useEffect, useMemo, useState } from 'react';
import { Form, Radio } from 'antd';
import Modal from 'components/shared/modal';
import Input from 'components/shared/input';
import Loader from 'components/shared/loader';
import Button from 'components/shared/button';
import WarningModal from 'components/shared/warningModal';
import PageTable from 'components/shared/table';
import notification from 'components/shared/notification';
import { ButtonType } from 'components/shared/button/type';
import { imagesSvg } from 'utils/constants/imagesSrc';
import { acceptWarningModal, handelCancel } from 'utils/helpers';
import { UserServiceContext } from 'utils/services/service/userService';
import { User } from 'utils/model/user';
import { handleValidation, validator } from 'utils/constants/validation';
import { UserRoles } from 'utils/constants/userRoles';
import { isDisabled } from 'utils/constants/companyValidation';
import { ModalType } from 'utils/constants/enum';

import styles from './users.module.scss';

export default function Users(): JSX.Element {
  const userService = useContext(UserServiceContext);

  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [limit, setLimit] = useState<number>(10);
  const [users, setUsers] = useState<Array<User>>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [defaultUser, setDefaultUser] = useState<User>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [countOfPage, setCountOfPage] = useState<number>(0);
  const [warningModalVisible, setWarningModalVisible] = useState<boolean>(
    false
  );
  const [user, setUser] = useState<User>(null);
  const [defaultCreateFormValue, setDefaultCreateFormValue] = useState<User>();
  const [passwordError, setPasswordErr] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [firstRefresh, setFirstRefresh] = useState<boolean>(true);
  const [modalType, setModalType] = useState<ModalType>();

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      tooltip: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      tooltip: true,
    },
    {
      title: 'Referral Code',
      dataIndex: 'referralCode',
      key: 'referralCode',
      tooltip: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      tooltip: true,
      width: '100px',
    },
    {
      title: 'Auth Provider',
      dataIndex: 'authProvider',
      key: 'authProvider',
      tooltip: true,
    },
    {
      width: '100px',
      key: 'changeRole',
      tooltip: true,
      render: (user: User) => (
        <div className={styles.buttonsContainer}>
          <Button
            isUpdatedButton={true}
            onClick={() => handleEdit(user)}
            btnType={ButtonType.edit}
            iconSrc={imagesSvg.editIcon}
          />
          <Button
            isUpdatedButton={true}
            onClick={() => removeUser(user)}
            btnType={ButtonType.delete}
            iconSrc={imagesSvg.deleteIcon}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    getAllUsers();
  }, [limit]);

  const getAllUsers = async (): Promise<void> => {
    const res = await userService.getAllUsers(limit, limit * (currentPage - 1));
    if (Array.isArray(res?.data)) {
      setCountOfPage(Math.ceil(res.count));
      setUsers(res?.data);
      setFirstRefresh(false);
    }
  };

  const setWarningModalVisibility = (): void => {
    setWarningModalVisible(!warningModalVisible);
  };

  const handleWarningModal = (): void => {
    acceptWarningModal(
      setWarningModalVisibility,
      modalType === ModalType.CREATE
        ? setCreateModalVisibility
        : setUpdateModalVisibility
    );
    createForm.resetFields();
  };

  const handleFormCancel = (value: boolean): void => {
    value
      ? handelCancel(
          defaultCreateFormValue,
          createForm.getFieldsValue(),
          setCreateModalVisibility,
          setWarningModalVisibility
        )
      : handelCancel(
          defaultUser,
          selectedUser,
          setUpdateModalVisibility,
          setWarningModalVisibility
        );
  };

  const handleEdit = (user: User): void => {
    setDefaultUser({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      bankAccount: user.bankAccount,
      authProvider: user.authProvider,
      emailVerificationToken: user.emailVerificationToken,
      referralCode: user.referralCode,
    });

    setSelectedUser({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      bankAccount: user.bankAccount,
      authProvider: user.authProvider,
      emailVerificationToken: user.emailVerificationToken,
      referralCode: user.referralCode,
    });

    setUpdateModalVisibility();
  };

  const removeUser = (user: User = null): void => {
    setUser(user);
  };

  useEffect(() => {
    editForm.resetFields();
  }, [modalVisible]);

  const disableButton = useMemo((): boolean => {
    if (
      defaultUser?.role === selectedUser?.role &&
      defaultUser?.username === selectedUser?.username &&
      defaultUser?.bankAccount === selectedUser?.bankAccount
    ) {
      return true;
    }
  }, [selectedUser]);

  const setUpdateModalVisibility = (): void => {
    setModalType(ModalType.EDIT);
    setModalVisible(!modalVisible);
  };

  const setCreateModalVisibility = (): void => {
    setModalType(ModalType.CREATE);
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      const myTimeout = setTimeout(() => {
        setDefaultCreateFormValue(createForm.getFieldsValue());
        clearTimeout(myTimeout);
      }, 100);
    }
  };

  const handleEditUser = async (): Promise<void> => {
    const updatedUser = await userService.updateUser(selectedUser);
    if (updatedUser?.success) {
      notification({
        messageType: 'success',
        message: 'Success',
        description: 'User successfully updated',
      });
      const foundUser = users.find(
        (user: User) => user._id === updatedUser.data._id
      );
      const foundUserIndex = users.indexOf(foundUser);
      const newArray = [...users];
      newArray[foundUserIndex] = updatedUser.data;
      setUsers(newArray);
    } else {
      notification({
        messageType: 'error',
        message: 'Oops!',
        description: 'Something went wrong, please try again.',
      });
    }
    setUpdateModalVisibility();
  };

  const handleCreateUser = async (): Promise<void> => {
    const {
      email,
      password,
      role,
      accountNumber,
      cardNumber,
      ifscOrSwiftCode,
    } = createForm.getFieldsValue();
    const createdUser = await userService.createUser(email, password, role, {
      accountNumber,
      ifscOrSwiftCode,
      cardNumber,
    });
    if (createdUser?.success) {
      notification({
        messageType: 'success',
        message: 'Success',
        description: createdUser?.message,
      });
      getAllUsers();
    } else {
      notification({
        messageType: 'error',
        message: 'Oops!',
        description: createdUser?.message,
      });
    }
    createForm.resetFields();
    setCreateModalVisibility();
  };

  const handleDeleteUser = async (id: string) => {
    const isDeleted = await userService.deleteUser(id);
    if (isDeleted) {
      notification({
        messageType: 'success',
        message: 'Success',
        description: 'User successfully deleted',
      });
      const arr = [...users];
      const index = arr.indexOf(arr.find((item: User) => item._id === id));
      arr.splice(index, 1);
      setUsers(arr);
      removeUser();
    } else {
      notification({
        messageType: 'error',
        message: 'Oops!',
        description: 'Something went wrong, please try again.',
      });
    }
  };

  return users.length || !firstRefresh ? (
    <div className={styles.container}>
      <WarningModal
        onCancel={() => removeUser()}
        onAccept={() => handleDeleteUser(user?._id)}
        visible={!!user}
        messageTitle={`Are you sure you want to delete ${user?.email} user`}
      />
      <div className={styles.headerText}>
        <h1>Users</h1>
      </div>
      <PageTable
        columns={columns}
        dataSource={users}
        limit={limit}
        creatingItem="User"
        countOfPage={countOfPage}
        setCreateModalVisibility={setCreateModalVisibility}
        setCurrentPage={setCurrentPage}
        setLimit={setLimit}
      />
      <Modal
        title={modalType === ModalType.EDIT ? 'Edit User' : 'Create User'}
        bodyStyle={{ overflow: 'auto' }}
        isModalVisible={modalVisible}
        className={styles.modal}
        onCancel={() => handleFormCancel(!(modalType === ModalType.EDIT))}
      >
        <WarningModal
          messageTitle="Are you sure you want to close this Modal?"
          visible={warningModalVisible}
          onAccept={handleWarningModal}
          onCancel={setWarningModalVisibility}
        />
        {modalType === ModalType.EDIT && (
          <Form
            className={styles.editUser}
            form={editForm}
            initialValues={{
              username: selectedUser?.username,
              email: selectedUser?.email,
              role: selectedUser?.role,
              emailVerificationToken: selectedUser?.emailVerificationToken,
              accountNumber: selectedUser?.bankAccount?.accountNumber,
              cardNumber: selectedUser?.bankAccount?.cardNumber,
              ifscOrSwiftCode: selectedUser?.bankAccount?.ifscOrSwiftCode,
            }}
            onFinish={handleEditUser}
          >
            <div className={styles.userInfo}>
              {selectedUser?.email && (
                <div className={styles.infoRows}>
                  <span className={styles.labelModal}>Email: </span>
                  <span>{selectedUser?.email}</span>
                </div>
              )}
            </div>
            <Form.Item
              name="username"
              label="Username"
              className={styles.formItem}
              rules={[
                {
                  required: true,
                  message: 'Please enter Username',
                },
                {
                  validator: (_, value) => validator(_, value),
                },
              ]}
            >
              <Input
                placeholder="Enter Username"
                onChange={(e) => {
                  setSelectedUser({
                    ...selectedUser,
                    username: e,
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              name="accountNumber"
              label="Account Number"
              className={styles.formItem}
              rules={[
                {
                  required: true,
                  message: 'Please enter Account Number',
                },
                {
                  validator: (_, value) => validator(_, value),
                },
              ]}
            >
              <Input
                placeholder="Enter Account Number"
                onChange={(e) => {
                  setSelectedUser({
                    ...selectedUser,
                    bankAccount: {
                      ...selectedUser.bankAccount,
                      accountNumber: e,
                    },
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              name="ifscOrSwiftCode"
              label="IFSC Or Swift Code"
              className={styles.formItem}
              rules={[
                {
                  required: true,
                  message: 'Please enter IFSC Or Swift Code',
                },
                {
                  validator: (_, value) => validator(_, value),
                },
              ]}
            >
              <Input
                placeholder="Enter IFSC Or Swift Code"
                onChange={(e) => {
                  setSelectedUser({
                    ...selectedUser,
                    bankAccount: {
                      ...selectedUser.bankAccount,
                      ifscOrSwiftCode: e,
                    },
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              name="cardNumber"
              label="Card Number"
              className={styles.formItem}
              rules={[
                {
                  required: true,
                  message: 'Please enter Card Number',
                },
                {
                  validator: (_, value) => validator(_, value),
                },
              ]}
            >
              <Input
                placeholder="Enter Card Number"
                onChange={(e) => {
                  setSelectedUser({
                    ...selectedUser,
                    bankAccount: {
                      ...selectedUser.bankAccount,
                      cardNumber: e,
                    },
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              label="Role"
              name="role"
              labelCol={{ span: 24 }}
              className={styles.radioForm}
            >
              <Radio.Group>
                <Radio
                  value={UserRoles.MERCHANT}
                  onChange={(e) => {
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    });
                  }}
                >
                  Merchant
                </Radio>
                <Radio
                  value={UserRoles.ADMIN}
                  onChange={(e) => {
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    });
                  }}
                >
                  Admin
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <div className={styles.modalButtonsContainer}>
                <Button
                  className={styles.modalButtons}
                  text="Edit user"
                  htmlType="submit"
                  disabled={disableButton}
                  btnType={ButtonType.black}
                />
                <Button
                  className={styles.modalButtons}
                  onClick={() => handleFormCancel(false)}
                  text="Cancel"
                  btnType={ButtonType.black}
                />
              </div>
            </Form.Item>
          </Form>
        )}
        {modalType === ModalType.CREATE && (
          <Form
            form={createForm}
            initialValues={{
              remember: true,
              role: UserRoles.MERCHANT,
            }}
            onFinish={handleCreateUser}
          >
            <div className={styles.inputsContainer}>
              <Form.Item
                name="username"
                label="Username"
                className={styles.formItem}
                rules={[
                  {
                    required: true,
                    message: 'Please input Username',
                  },
                  {
                    validator: (_, value) => validator(_, value),
                  },
                ]}
              >
                <Input placeholder="Enter Username" />
              </Form.Item>
              <Form.Item
                name="accountNumber"
                label="Account Number"
                className={styles.formItem}
                rules={[
                  {
                    required: true,
                    message: 'Please input Account Number',
                  },
                  {
                    validator: (_, value) => validator(_, value),
                  },
                ]}
              >
                <Input placeholder="Enter Account Number" />
              </Form.Item>
              <Form.Item
                name="ifscOrSwiftCode"
                label="IFSC Or Swift Code"
                className={styles.formItem}
                rules={[
                  {
                    required: true,
                    message: 'Please input IFSC Or Swift Code',
                  },
                  {
                    validator: (_, value) => validator(_, value),
                  },
                ]}
              >
                <Input placeholder="Enter IFSC Or Swift Code" />
              </Form.Item>
              <Form.Item
                name="cardNumber"
                label="Card Number"
                className={styles.formItem}
                rules={[
                  {
                    required: true,
                    message: 'Please input Card Number',
                  },
                  {
                    validator: (_, value) => validator(_, value),
                  },
                ]}
              >
                <Input placeholder="Enter Card Number" />
              </Form.Item>
              <Form.Item
                name="email"
                className={styles.formItem}
                validateStatus="success"
                label="Email"
                labelCol={{ span: 24 }}
                rules={[
                  {
                    type: 'email',
                    message: 'Please enter valid email address.',
                  },
                  { required: true, message: 'Please input your Email!' },
                ]}
              >
                <Input type="email" placeholder="namesurname@mail.com" />
              </Form.Item>
              <div className={styles.passwordContainer}>
                <Form.Item
                  name="password"
                  label="Password"
                  labelCol={{ span: 24 }}
                  className={styles.formItem}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (passwordSuccess) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error(passwordError));
                      },
                    }),
                    { required: true, message: 'Please input your Password!' },
                  ]}
                >
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    onChange={(e) =>
                      handleValidation(e, setPasswordErr, setPasswordSuccess)
                    }
                  />
                </Form.Item>
              </div>
              <Form.Item label="Role" name="role" labelCol={{ span: 24 }}>
                <Radio.Group>
                  <Radio value={UserRoles.MERCHANT}>Merchant</Radio>
                  <Radio value={UserRoles.ADMIN}>Admin</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
            <div className={styles.buttonSection}>
              <Form.Item shouldUpdate>
                {() => (
                  <Button
                    className={styles.submitButton}
                    htmlType="submit"
                    text="Submit"
                    disabled={isDisabled(createForm)}
                    btnType={ButtonType.black}
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  className={styles.rightButton}
                  text="Cancel"
                  onClick={() => handleFormCancel(true)}
                  btnType={ButtonType.white}
                />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  ) : (
    <Loader />
  );
}