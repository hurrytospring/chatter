'use client'

import * as MUI from '@mui/material'
import { runCodeSync } from '../code_runner'
import React from 'react'

function run() {
  // const code=getCodeById
  const code = `const { Card, CardContent, Typography, Grid } = MUI;

    const MenuCard = ({ title, price, weight }) => {
        return React.createElement(
            Card,
            { style: { minWidth: 275, marginBottom: 2 } },
            React.createElement(
                CardContent,
                null,
                React.createElement(
                    Typography,
                    { variant: 'h5', component: 'div' },
                    title
                ),
                React.createElement(
                    Typography,
                    { style: { marginBottom: 1.5 }, color: 'text.secondary' },
                    \`$\{price\}元 | \${weight}克\`
                )
            )
        );
    };
    
    const RestaurantMenu = () => {
        const menuItems = [
            { title: '宫保鸡丁', price: 40, weight: 300 },
            { title: '牛肉滑蛋', price: 30, weight: 200 },
            { title: '西红柿鸡蛋', price: 18, weight: 500 },
            { title: '酸辣土豆丝', price: 15, weight: 600 },
            { title: '土豆红烧肉', price: 80, weight: 800 },
            { title: '葱爆羊肉', price: 140, weight: 400 },
        ];
    
        return React.createElement(
            Grid,
            { container: true, spacing: 2 },
            menuItems.map((item, index) =>
                React.createElement(
                    Grid,
                    { item: true, xs: 12, sm: 6, md: 4, key: index },
                    React.createElement(MenuCard, { title: item.title, price: item.price, weight: item.weight })
                )
            )
        );
    };
    return React.createElement(RestaurantMenu)
    `
  return runCodeSync(code, { MUI, React })
}

export default function DynamicRender() {
  // redirect to home if user is already logged in
  return run()
}
