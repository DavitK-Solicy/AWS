import React from 'react'
import { Input } from 'antd';
import Icon from 'components/shared/icon';
import { SearchProps } from './types';

import styles from './search.module.scss'

export default function SearchInput( { searchIcon,closeIcon,...rest } : SearchProps ) {
  return (
    <div className={`${styles.searchInput} ${rest.className ?? ''}`}>
        {searchIcon && <Icon src={searchIcon} width={16} height={16}/>} 
        <Input className={styles.input}  bordered={false} placeholder='Search' {...rest} />
        {closeIcon && <Icon src={closeIcon} width={13} height={13} />} 
    </div>
  )
}
